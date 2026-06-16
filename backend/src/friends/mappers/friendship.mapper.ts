import { FriendshipResponseDto, FriendResponseDto } from '@shared/friendship/friendship-response.dto';
import { FriendshipSnapshot } from '@shared/friendship/friendship-snapshot.type';
import { toUserResponse } from 'src/users/mappers/user.mapper';

// export function toFriendshipResponse(friendship: any): FriendshipResponseDto {
//   return {
//     id: friendship.id,
//     requesterId: friendship.requesterId,
//     addresseeId: friendship.addresseeId,
//     status: friendship.status,
//     createdAt: friendship.createdAt,
//     updatedAt: friendship.updatedAt,
//   };
// }

export function toFriendshipResponse(friendship: any): FriendshipResponseDto {
  return {
    id: friendship.id,
    requester: toUserResponse(friendship.requester),
    addressee: toUserResponse(friendship.addressee),
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

  return { id: friendship.id, friend: toUserResponse(friendRaw) };
}