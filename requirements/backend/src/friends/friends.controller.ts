import {
  Controller,
  Post,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';

import { FriendsService } from './friends.service';

import { JwtAuthGuard }
  from '../auth/guards/jwt-auth.guard';

import { CurrentUser }
  from '../auth/decorators/current-user.decorator';

import { AccessTokenPayload }
  from '../auth/types/access-token-payload.type';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private friends: FriendsService) {}

  @Post('request/:id')
  sendRequest(@Param('id') id: number, @CurrentUser() user) {
    return this.friends.sendRequest(user.sub, id);
  }

  @Post('accept/:id')
  accept(@Param('id') id: number, @CurrentUser() user) {
    return this.friends.accept(id, user.sub);
  }

  @Get()
  list(@CurrentUser() user) {
    return this.friends.listFriends(user.sub);
  }
}