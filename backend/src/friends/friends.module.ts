import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { FriendshipPolicy } from './policies/friendship.policy';
import { ChatModule } from '../chat/chat.module';
import { PresenceService } from '../websocket/presence.service';

@Module({
  imports: [ChatModule],
  controllers: [FriendsController],
  providers: [FriendsService, FriendshipPolicy, PresenceService],
  exports: [FriendsService, PresenceService],
})
export class FriendsModule {}