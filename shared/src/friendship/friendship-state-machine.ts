import { FriendshipStatus } from './friendship-status.type';

export const FriendshipTransitions: Record<
  FriendshipStatus,
  readonly FriendshipStatus[]
> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'BLOCKED'],
  ACCEPTED: ['BLOCKED'],
  REJECTED: [],
  BLOCKED: [],
} as const;