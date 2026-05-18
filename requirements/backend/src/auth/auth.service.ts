import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from './jwt.service';
import { User } from '@prisma/client';
import { SessionService } from './session.service';
import { RefreshRequestUser } from './types/authenticated-request.type';
import { ApiErrors } from '../common/errors/api-exceptions.helper';

@Injectable()
export class AuthService {
  private static readonly REFRESH_SESSION_DURATION_MS =
    1000 * 60 * 60 * 24 * 30;

  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
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

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);

    const session = await this.sessionService.create(
      user.id,
      new Date(Date.now() + AuthService.REFRESH_SESSION_DURATION_MS),
      '',
    );

    return this.issueTokens(session.id, user.id);
  }

  async refresh(user: RefreshRequestUser) {
    const newSession = await this.sessionService.rotate(
      user.sessionId,
      user.sub,
      user.refreshToken,
    );

    return this.issueTokens(newSession.id, user.sub);
  }

  private async issueTokens(sessionId: string, userId: number) {
    const refreshToken = this.jwtService.generateRefreshToken({
      sessionId,
      sub: userId,
    });

    const hash = await this.passwordService.hash(refreshToken);

    await this.sessionService.updateHash(sessionId, hash);

    const accessToken = this.jwtService.generateAccessToken(userId);

    return {
      accessToken,
      refreshToken,
    };
  }
}