import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { FriendshipPolicy } from './policies/friendship.policy';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService, FriendshipPolicy],
})
export class FriendsModule {}