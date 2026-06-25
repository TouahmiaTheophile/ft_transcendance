import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { PresenceService } from '../presence.service';
import { RealtimeService } from '../realtime.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true,
  },
})
export class WsAuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private tokenService: TokenService,
    private presenceService: PresenceService,
    private realtimeService: RealtimeService,
  ) {}

  private extractAccessToken(client: Socket): string | null {
    const cookie = client.handshake.headers.cookie;

    if (!cookie) return null;

    const match = cookie
      .split(';')
      .find(c => c.trim().startsWith('accessToken='));

    return match?.split('=')[1] ?? null;
  }

  async handleConnection(client: Socket) {
    console.log(`handleConnection`);
    const token = this.extractAccessToken(client);

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload =
        this.tokenService.verifyAccessToken(token);

      client.data.userId = payload.sub;
      console.log(`payload.sub: ${payload.sub}`);
      console.log(`client.data.userId: ${client.data.userId}`);

      const wasOnline = this.presenceService.isOnline(payload.sub);
      this.presenceService.connect(payload.sub, client.id);

      client.join(`user:${payload.sub}`);

      if (!wasOnline) {
        await this.realtimeService.notifyFriendsOnline(payload.sub);
      }
    } catch (err) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      this.presenceService.disconnect(userId, client.id);
      console.log(`User ${userId} disconnected`);

      if (!this.presenceService.isOnline(userId)) {
        await this.realtimeService.notifyFriendsOffline(userId);
      }
    }
  }
}