import { TransitionMap } from '../state-machine/state-machine.types';
import { FriendshipStatus } from './friendship-snapshot.type';

export const FRIENDSHIP_TRANSITIONS: TransitionMap<FriendshipStatus> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'BLOCKED'],
  ACCEPTED: ['BLOCKED'],
  REJECTED: [],
  BLOCKED: [],
};