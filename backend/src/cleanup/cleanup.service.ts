import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

const MESSAGE_MAX_AGE_DAYS         = 30;
const MESSAGE_MAX_PER_CONVERSATION = 30;

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runAll() {
    this.logger.log('Starting nightly cleanup...');
    await this.cleanRevokedSessions();
    await this.cleanExpiredSessions();
    await this.cleanRejectedFriendships();
    await this.cleanOldMessages();
    await this.cleanExcessMessages();
    this.logger.log('Nightly cleanup complete.');
  }

  private async cleanRevokedSessions() {
    const { count } = await this.prisma.refreshSession.deleteMany({
      where: { revokedAt: { not: null } },
    });
    this.logger.log(`Deleted ${count} revoked session(s).`);
  }

  private async cleanExpiredSessions() {
    const { count } = await this.prisma.refreshSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`Deleted ${count} expired session(s).`);
  }

  private async cleanRejectedFriendships() {
    const { count } = await this.prisma.friendship.deleteMany({
      where: { status: 'REJECTED' },
    });
    this.logger.log(`Deleted ${count} rejected friendship(s).`);
  }

  private async cleanOldMessages() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MESSAGE_MAX_AGE_DAYS);

    const { count } = await this.prisma.message.deleteMany({
      where: { sentAt: { lt: cutoff } },
    });
    this.logger.log(`Deleted ${count} message(s) older than ${MESSAGE_MAX_AGE_DAYS} days.`);
  }

  private async cleanExcessMessages() {
    const conversations = await this.prisma.conversation.findMany({
      include: { _count: { select: { messages: true } } },
    });

    let totalDeleted = 0;

    for (const conv of conversations) {
      const excess = conv._count.messages - MESSAGE_MAX_PER_CONVERSATION;
      if (excess <= 0) continue;

      const oldest = await this.prisma.message.findMany({
        where: { conversationId: conv.id },
        orderBy: { sentAt: 'asc' },
        take: excess,
        select: { id: true },
      });

      const { count } = await this.prisma.message.deleteMany({
        where: { id: { in: oldest.map(m => m.id) } },
      });

      totalDeleted += count;
    }

    this.logger.log(`Deleted ${totalDeleted} excess message(s) over per-conversation limit.`);
  }
}