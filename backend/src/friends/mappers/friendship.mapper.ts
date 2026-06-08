import { FriendshipResponseDto, FriendResponseDto } from '@shared/friendship/friendship-response.dto';
import { FriendshipSnapshot } from '@shared/friendship/friendship-snapshot.type';
import { UserResponseDto } from '@shared/users/user-response.dto';

export function toFriendshipResponse(friendship: any): FriendshipResponseDto {
  return {
    id: friendship.id,
    requesterId: friendship.requesterId,
    addresseeId: friendship.addresseeId,
    status: friendship.status,
    createdAt: friendship.createdAt,
    updatedAt: friendship.updatedAt,
  };
}

export function toFriendshipSnapshot(friendship: any): FriendshipSnapshot {
  return {
    id: friendship.id,
    requesterId: friendship.requesterId,
    addresseeId: friendship.addresseeId,
    status: friendship.status,
    createdAt: friendship.createdAt,
  };
}

export function toFriendResponse(friendship: any, userId: number): FriendResponseDto {
  const friendRaw =
    friendship.requesterId === userId
      ? friendship.addressee
      : friendship.requester;

  const friend: UserResponseDto = {
    id: friendRaw.id,
    username: friendRaw.username,
  };

  return { id: friendship.id, friend };
}