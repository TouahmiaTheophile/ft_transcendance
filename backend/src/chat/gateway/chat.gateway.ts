import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat.service';
import { WsJwtGuard } from './ws-jwt.guard';
import {
  JoinConversationPayload,
  LeaveConversationPayload,
  SendMessagePayload,
} from '@shared/chat/chat.types';
import { TokenService } from 'src/auth/token.service';

@WebSocketGateway({ cors: { origin: 'http://localhost:3001', credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private tokenService: TokenService
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

      client.data.user = payload;

      client.join(`user:${payload.sub}`);
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {}

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinConversationPayload,
  ) {
    const userId = client.data.user.sub;
    const { conversationId, limit } = payload;

    const isParticipant = await this.chatService.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new WsException({ code: 'FORBIDDEN', message: 'You are not a participant of this conversation' });
    }

    client.join(`conversation:${conversationId}`);

    const messages = await this.chatService.getMessages(conversationId, userId, limit);
    client.emit('history', messages);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeaveConversationPayload,
  ) {
    client.leave(`conversation:${payload.conversationId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const userId = client.data.user.sub;
    const { conversationId, content } = payload;

    if (!content || content.length > 150) {
      throw new WsException({ code: 'VALIDATION_ERROR', message: 'Message must be between 1 and 150 characters' });
    }

    const isParticipant = await this.chatService.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new WsException({ code: 'FORBIDDEN', message: 'You are not a participant of this conversation' });
    }

    const message = await this.chatService.saveMessage(conversationId, userId, content);
    this.server.to(`conversation:${conversationId}`).emit('message', message);
  }
}