import { Injectable } from '@nestjs/common';
import { canTransition } from '@shared/state-machine/create-state-machine';
import { FRIENDSHIP_TRANSITIONS } from '@shared/friendship/friendship-transitions';
import { FriendshipErrors } from '../errors/friendship.errors';

@Injectable()
export class FriendshipPolicy {
  assertSendRequest(requesterId: number, addresseeId: number) {
    if (requesterId === addresseeId) {
      throw FriendshipErrors.selfRequest();
    }
  }

  assertCreateAllowed(existing: any) {
    if (existing) {
      throw FriendshipErrors.alreadyExists(existing);
    }
  }

  assertAccept(friendship: any, userId: number) {
    if (friendship.addresseeId !== userId) {
      throw FriendshipErrors.forbidden(friendship);
    }
    if (!canTransition(FRIENDSHIP_TRANSITIONS, friendship.status, 'ACCEPTED')) {
      throw FriendshipErrors.notPending(friendship);
    }
  }

  assertReject(friendship: any, userId: number) {
    if (friendship.addresseeId !== userId) {
      throw FriendshipErrors.forbidden(friendship);
    }
    if (!canTransition(FRIENDSHIP_TRANSITIONS, friendship.status, 'REJECTED')) {
      throw FriendshipErrors.notPending(friendship);
    }
  }
}