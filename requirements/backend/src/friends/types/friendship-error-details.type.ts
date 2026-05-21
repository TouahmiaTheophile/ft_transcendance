// import { FriendshipSnapshot } from './friendship-snapshot.type';
import { FriendshipSnapshot } from '@shared/friendship/friendship-snapshot.type';

export type FriendshipErrorReason =
  | 'SELF_REQUEST'
  | 'ALREADY_EXISTS'
  | 'NOT_PENDING'
  | 'FORBIDDEN';

export type FriendshipErrorDetails = {
  reason: FriendshipErrorReason;
  friendship?: FriendshipSnapshot | null;
};