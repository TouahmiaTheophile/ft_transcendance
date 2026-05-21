// src/auth/guards/refresh-token.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../token.service';
import { ApiErrors } from '../../common/errors/api-exceptions.helper';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    let token = request.cookies?.refreshToken;

    if (!token) {
      throw ApiErrors.unauthorized('Missing refresh token');
    }

    try {
      const payload = this.tokenService.verifyRefreshToken(token);

      request.user = {
        sessionId: payload.sessionId,
        sub: payload.sub,
        refreshToken: token,
      };

      return true;
    } catch {
      throw ApiErrors.unauthorized('Invalid refresh token');
    }
  }
}