import { FriendshipStatus } from './friendship-status.type';
import { FriendshipTransitions } from './friendship-state-machine';

export function canTransition(
  from: FriendshipStatus,
  to: FriendshipStatus,
): boolean {
  return FriendshipTransitions[from].includes(to);
}

export function assertTransition(
  from: FriendshipStatus,
  to: FriendshipStatus,
) {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid friendship transition: ${from} → ${to}`,
    );
  }
}