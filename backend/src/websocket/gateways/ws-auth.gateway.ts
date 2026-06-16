import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { PresenceService } from '../presence.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WsAuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private tokenService: TokenService,
    private presenceService: PresenceService,
  ) {}

  private extractAccessToken(client: Socket): string | null {
    const cookie = client.handshake.headers.cookie;

    if (!cookie) return null;

    const match = cookie
      .split(';')
      .find(c => c.trim().startsWith('accessToken='));

    return match?.split('=')[1] ?? null;
  }

  handleConnection(client: Socket) {
    const token = this.extractAccessToken(client);

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload =
        this.tokenService.verifyAccessToken(token);

      client.data.userId = payload.sub;

      this.presenceService.connect(payload.sub, client.id);

      client.join(`user:${payload.sub}`);
    } catch (err) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      this.presenceService.disconnect(userId, client.id);
      console.log(`User ${userId} disconnected`);
    }
  }
}