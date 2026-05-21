// import { FriendshipSnapshot } from '../types/friendship-snapshot.type';
import { FriendshipSnapshot } from '@shared/friendship/friendship-snapshot.type';

export function toFriendshipSnapshot(friendship: any): FriendshipSnapshot {
  return {
    id: friendship.id,
    requesterId: friendship.requesterId,
    addresseeId: friendship.addresseeId,
    status: friendship.status,
    createdAt: friendship.createdAt,
  };
}