import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiErrors } from '../common/errors/api-exceptions.helper';
import {
  CONVERSATION_INCLUDE,
  MESSAGE_INCLUDE,
  toConversationResponse,
  toMessageResponse,
} from './mappers/chat.mapper';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Called by FriendsService when a friendship is accepted
  async createConversation(friendshipId: number) {
    return this.prisma.conversation.create({
      data: { friendshipId },
    });
  }

  // Called by FriendsService when a friendship is blocked
  async deleteConversationByFriendship(friendshipId: number) {
    await this.prisma.conversation.deleteMany({
      where: { friendshipId },
    });
  }

  async getMyConversations(userId: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        friendship: {
          status: 'ACCEPTED',
          OR: [
            { requesterId: userId },
            { addresseeId: userId },
          ],
        },
      },
      include: CONVERSATION_INCLUDE,
    });

    return conversations.map(c => toConversationResponse(c, userId));
  }

  async getMessages(conversationId: number, userId: number, limit: number) {
    await this.assertParticipant(conversationId, userId);

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { sentAt: 'desc' },
      take: limit,
      include: MESSAGE_INCLUDE,
    });

    return messages.reverse().map(toMessageResponse);
  }

  async saveMessage(conversationId: number, userId: number, content: string) {
    await this.assertParticipant(conversationId, userId);

    const message = await this.prisma.message.create({
      data: { conversationId, userId, content },
      include: MESSAGE_INCLUDE,
    });

    return toMessageResponse(message);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  async assertParticipant(conversationId: number, userId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { friendship: true },
    });

    if (!conversation) throw ApiErrors.notFound('Conversation not found');

    const { requesterId, addresseeId } = conversation.friendship;
    if (userId !== requesterId && userId !== addresseeId) {
      throw ApiErrors.forbidden('You are not a participant of this conversation');
    }
  }

  async isParticipant(conversationId: number, userId: number): Promise<boolean> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { friendship: true },
    });

    if (!conversation) return false;

    const { requesterId, addresseeId } = conversation.friendship;
    return userId === requesterId || userId === addresseeId;
  }
}