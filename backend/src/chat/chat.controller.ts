import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '../auth/types/access-token-payload.type';
import { GetMessagesDto } from './dto/get-messages.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  getMyConversations(@CurrentUser() user: AccessTokenPayload) {
    return this.chatService.getMyConversations(user.sub);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: GetMessagesDto,
  ) {
    return this.chatService.getMessages(id, user.sub, query.limit);
  }
}