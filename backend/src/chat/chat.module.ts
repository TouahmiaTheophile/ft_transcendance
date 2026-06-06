import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateway/chat.gateway';
import { WsJwtGuard } from './gateway/ws-jwt.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ChatService, ChatGateway, WsJwtGuard],
  controllers: [ChatController],
  exports: [ChatService, ChatGateway], // ChatGateway exported for FriendsService
})
export class ChatModule {}