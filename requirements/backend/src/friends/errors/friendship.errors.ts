import { ApiException } from '../../common/errors/api.exception';
import { toFriendshipSnapshot } from '../mappers/friendship.mapper';
import { FriendshipSnapshot } from '@shared/friendship/friendship-snapshot.type';

export const FriendshipErrors = {
  selfRequest() {
    return new ApiException({
      code: 'FRIENDSHIP_SELF_REQUEST',
      message: "You can't add yourself",
      details: null,
    });
  },

  alreadyExists(friendship: FriendshipSnapshot) {
    return new ApiException({
      code: 'FRIENDSHIP_ALREADY_EXISTS',
      message: 'Friendship already exists or request pending',
      details: { friendship: toFriendshipSnapshot(friendship) },
    });
  },

  notPending(friendship: FriendshipSnapshot) {
    return new ApiException({
      code: 'FRIENDSHIP_NOT_PENDING',
      message: 'Friend request is not pending',
      details: { friendship: toFriendshipSnapshot(friendship) },
    });
  },

  forbidden(friendship: FriendshipSnapshot) {
    return new ApiException({
      code: 'FRIENDSHIP_FORBIDDEN',
      message: 'You cannot perform this action',
      details: { friendship: toFriendshipSnapshot(friendship) },
    });
  },
};