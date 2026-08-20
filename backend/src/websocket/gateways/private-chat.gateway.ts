import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';
import { JoinConversationPayload, LeaveConversationPayload, SendMessagePayload } from '../dto/private-chat.dto';

@WebSocketGateway({
  cors: {
    origin: [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://localhost',
    'https://127.0.0.1',
  ],
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
  ) {}

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinConversationPayload,
  ) {
    const userId = client.data.userId;
    console.log(`UserId: ${userId}`);
    const { conversationId, limit } = payload;

    const isParticipant = await this.chatService.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new WsException({ code: 'FORBIDDEN', message: 'You are not a participant of this conversation' });
    }

    client.join(`conversation:${conversationId}`);

    const messages = await this.chatService.getMessages(conversationId, userId, limit);
    client.emit('history', messages);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeaveConversationPayload,
  ) {
    client.leave(`conversation:${payload.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const userId = client.data.userId;
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