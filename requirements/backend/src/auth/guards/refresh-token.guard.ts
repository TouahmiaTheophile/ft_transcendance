import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../jwt.service';
import { ApiErrors } from '../../common/errors/api-exceptions.helper';

@Injectable()
export class RefreshTokenGuard
  implements CanActivate
{
  constructor(
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw ApiErrors.unauthorized('Missing authorization header');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw ApiErrors.unauthorized('Invalid authorization header');
    }

    try {
      const payload = this.jwtService.verifyRefreshToken(token);

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