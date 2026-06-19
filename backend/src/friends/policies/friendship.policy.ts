import { Injectable } from '@nestjs/common';
import { canTransition } from '@shared/state-machine/create-state-machine';
import { FRIENDSHIP_TRANSITIONS } from '@shared/friendship/friendship-transitions';
import { FriendshipErrors } from '../errors/friendship.errors';
import { Friendship } from '@prisma/client';

@Injectable()
export class FriendshipPolicy {
  assertSendRequest(requesterId: number, addresseeId: number) {
    if (requesterId === addresseeId) {
      throw FriendshipErrors.selfRequest();
    }
  }

  assertCreateAllowed(existing: Friendship) {
    if (existing) {
      throw FriendshipErrors.alreadyExists(existing);
    }
  }

  assertAccept(friendship: Friendship, userId: number) {
    if (friendship.addresseeId !== userId) {
      throw FriendshipErrors.forbidden(friendship);
    }
    if (!canTransition(FRIENDSHIP_TRANSITIONS, friendship.status, 'ACCEPTED')) {
      throw FriendshipErrors.notPending(friendship);
    }
  }

  assertReject(friendship: Friendship, userId: number) {
    if (friendship.addresseeId !== userId) {
      throw FriendshipErrors.forbidden(friendship);
    }
    if (!canTransition(FRIENDSHIP_TRANSITIONS, friendship.status, 'REJECTED')) {
      throw FriendshipErrors.notPending(friendship);
    }
  }

  assertBlock(friendship: Friendship) {
    if (!canTransition(FRIENDSHIP_TRANSITIONS, friendship.status, 'BLOCKED')) {
      throw FriendshipErrors.cannotBlock(friendship);
    }
  }
}