import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokenService } from '../../auth/token.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    const token = client.handshake.headers.cookie
      ?.split(';')
      .find(c => c.trim().startsWith('accessToken='))
      ?.split('=')[1];

    if (!token) {
      throw new WsException({ code: 'UNAUTHORIZED', message: 'Missing access token' });
    }

    try {
      const payload = this.tokenService.verifyAccessToken(token);
      client.data.user = payload;
      return true;
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new WsException({ code: 'UNAUTHORIZED', message: 'Access token expired' });
      }
      throw new WsException({ code: 'UNAUTHORIZED', message: 'Invalid access token' });
    }
  }
}