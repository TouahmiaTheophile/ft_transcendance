import { TransitionMap } from '@shared/state-machine/state-machine.types';
import { FriendshipStatus } from './friendship-state';

export const FRIENDSHIP_TRANSITIONS: TransitionMap<FriendshipStatus> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'BLOCKED'],
  ACCEPTED: ['BLOCKED'],
  REJECTED: [],
  BLOCKED: [],
};