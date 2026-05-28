import { Injectable } from '@nestjs/common';
import { FRIENDSHIP_TRANSITIONS } from '../state/friendship-transitions';
import { assertTransition } from '@shared/state-machine/create-state-machine';
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

    assertTransition(
      FRIENDSHIP_TRANSITIONS,
      friendship.status,
      'ACCEPTED',
      () => FriendshipErrors.notPending(friendship),
    );
  }

  assertReject(friendship: any, userId: number) {
    if (friendship.addresseeId !== userId) {
      throw FriendshipErrors.forbidden(friendship);
    }

    assertTransition(
      FRIENDSHIP_TRANSITIONS,
      friendship.status,
      'REJECTED',
      () => FriendshipErrors.notPending(friendship),
    );
  }
}