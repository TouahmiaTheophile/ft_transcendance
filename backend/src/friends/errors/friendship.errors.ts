import { ApiException } from '../../common/errors/api.exception';
import { toFriendshipSnapshot } from '../mappers/friendship.mapper';
import { FriendshipSnapshot } from '@shared/friendship/friendship-snapshot.type';

export const FriendshipErrors = {
  selfRequest() {
    return new ApiException({
      code: 'FRIENDSHIP_SELF_REQUEST',
      statusCode: 400,
      message: "You can't add yourself",
      details: null,
    });
  },

  alreadyExists(friendship: FriendshipSnapshot) {
    return new ApiException({
      code: 'FRIENDSHIP_ALREADY_EXISTS',
      statusCode: 409,
      message: 'Friendship already exists or request pending',
      details: { friendship: toFriendshipSnapshot(friendship) },
    });
  },

  notPending(friendship: FriendshipSnapshot) {
    return new ApiException({
      code: 'FRIENDSHIP_NOT_PENDING',
      statusCode: 409,
      message: 'Friend request is not pending',
      details: { friendship: toFriendshipSnapshot(friendship) },
    });
  },

  forbidden(friendship: FriendshipSnapshot) {
    return new ApiException({
      code: 'FRIENDSHIP_FORBIDDEN',
      statusCode: 403,
      message: 'You cannot perform this action',
      details: { friendship: toFriendshipSnapshot(friendship) },
    });
  },

  cannotBlock(friendship: FriendshipSnapshot) {
    return new ApiException({
      code: 'FRIENDSHIP_CANNOT_BLOCK',
      statusCode: 409,
      message: 'Cannot block from this state',
      details: { friendship: toFriendshipSnapshot(friendship) },
    });
  },

  cannotSendRequest(friendship: FriendshipSnapshot) {
    return new ApiException({
      code: 'FRIENDSHIP_CANNOT_SEND',
      statusCode: 409,
      message: 'Cannot send request from this state',
      details: { friendship: toFriendshipSnapshot(friendship) },
    });
  },
};