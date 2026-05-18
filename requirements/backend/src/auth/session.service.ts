import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { ApiException } from '../common/errors/api.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { ApiErrors } from '../common/errors/api-exceptions.helper';

@Injectable()
export class SessionService {
  constructor(
	private prisma: PrismaService,
	private passwordService: PasswordService,
  ) {}

  create(userId: number, expiresAt: Date, refreshTokenHash: string) {
    return this.prisma.refreshSession.create({
      data: {
        user: {
          connect: { id: userId },
        },
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
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw ApiErrors.unauthorized('Session revoked');
    }
  }

  async rotate(sessionId: string, userId: number, refreshToken: string) {
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

    await this.revoke(session.id);

    const newSession = await this.create(
      userId,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      '',
    );

    return newSession;
  }
}