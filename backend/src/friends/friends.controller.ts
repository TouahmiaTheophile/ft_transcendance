import { Controller, Post, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '../auth/types/access-token-payload.type';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private friends: FriendsService) {}

  // Send friend request
  @Post('request/:id')
  sendRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.friends.sendRequest(user.sub, id);
  }

  // Accept pending request
  @Post('accept/:id')
  accept(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.friends.accept(id, user.sub);
  }

  // Reject pending request
  @Post('reject/:id')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.friends.reject(id, user.sub);
  }

  // List accepted friends
  @Get()
  listFriends(@CurrentUser() user: AccessTokenPayload) {
    return this.friends.listFriends(user.sub);
  }

  // List pending requests
  @Get('pending')
  listPending(@CurrentUser() user: AccessTokenPayload) {
    return this.friends.listPending(user.sub);
  }
}