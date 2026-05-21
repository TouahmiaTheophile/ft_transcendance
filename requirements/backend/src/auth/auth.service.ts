import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/security/password.service';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './token.service';
import { User } from '@prisma/client';
import { SessionService } from './session.service';
import { RefreshRequestUser } from './types/authenticated-request.type';
import { ApiErrors } from '../common/errors/api-exceptions.helper';
import { AuthTokens } from './types/auth-tokens.type'

@Injectable()
export class AuthService {
  private static readonly REFRESH_SESSION_DURATION_MS =
    1000 * 60 * 60 * 24 * 30;

  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private sessionService: SessionService,
  ) {}

  private async validateUser(dto: LoginDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw ApiErrors.unauthorized('Invalid credentials');
    }

    const valid = await this.passwordService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!valid) {
      throw ApiErrors.unauthorized('Invalid credentials');
    }

    return user;
  }

  private async issueTokens(sessionId: string, userId: number): Promise<AuthTokens> {
    const refreshToken = this.tokenService.generateRefreshToken({
      sessionId,
      sub: userId,
    });

    const hash = await this.passwordService.hash(refreshToken);

    await this.sessionService.updateHash(sessionId, hash);

    const accessToken = this.tokenService.generateAccessToken(userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.validateUser(dto);

    const session = await this.sessionService.create(
      user.id,
      new Date(Date.now() + AuthService.REFRESH_SESSION_DURATION_MS),
      '',
    );

    const result = await this.issueTokens(session.id, user.id);

    return result;
  }

  async refresh(user: RefreshRequestUser): Promise<AuthTokens> {
    const { userId, sessionId } = await this.sessionService.rotate(
      user.sessionId,
      user.refreshToken,
    );

    const newTokens = await this.issueTokens(sessionId, userId);

    return newTokens;
  }
}