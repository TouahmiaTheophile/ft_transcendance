import { TransitionMap } from '../state-machine/state-machine.types';
import { FriendshipStatus } from './friendship-snapshot.type';

// BLOCKED is reachable from both PENDING and ACCEPTED
export const FRIENDSHIP_TRANSITIONS: TransitionMap<FriendshipStatus> = {
  PENDING:  ['ACCEPTED', 'REJECTED', 'BLOCKED'],
  ACCEPTED: ['BLOCKED'],
  REJECTED: ['PENDING'],
  BLOCKED:  [],
};