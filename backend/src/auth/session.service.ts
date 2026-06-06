import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiErrors } from '../common/errors/api-exceptions.helper';
import { PasswordService } from '../common/security/password.service';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
	  private passwordService: PasswordService,
  ) {}

  create(userId: number, expiresAt: Date, refreshTokenHash: string) {
    return this.prisma.refreshSession.create({
      data: {
        user: { connect: { id: userId } },
        expiresAt,
        refreshTokenHash,
      },
    });
  }

  find(sessionId: string) {
    return this.prisma.refreshSession.findUnique({
      where: { id: sessionId },
    });
  }

  updateHash(sessionId: string, hash: string) {
    return this.prisma.refreshSession.update({
      where: { id: sessionId },
      data: { refreshTokenHash: hash },
    });
  }

  async revoke(sessionId: string) {
    const result = await this.prisma.refreshSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async rotate(sessionId: string, refreshToken: string) {
    const session = await this.find(sessionId);

    if (!session) {
      throw ApiErrors.unauthorized('Session not found');
    }

    if (session.revokedAt) {
      throw ApiErrors.unauthorized('Session revoked');
    }

    if (session.expiresAt < new Date()) {
      throw ApiErrors.unauthorized('Session expired');
    }

    const isValid = await this.passwordService.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isValid) {
      throw ApiErrors.unauthorized('Invalid refresh token');
    }

    return {
      sessionId: session.id,
      userId: session.userId,
    };
  }
}