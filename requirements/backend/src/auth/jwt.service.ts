import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { RefreshTokenPayload } from './types/refresh-token-payload.type';

@Injectable()
export class JwtService {
  constructor(private jwt: NestJwtService) {}

  generateAccessToken(userId: number) {
    return this.jwt.sign(
      { sub: userId },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );
  }

  verifyAccessToken(token: string) {
    return this.jwt.verify(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  generateRefreshToken(payload: RefreshTokenPayload) {
    return this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.jwt.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    }) as RefreshTokenPayload;
  }
}