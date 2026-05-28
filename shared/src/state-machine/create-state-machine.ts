import { TransitionMap } from './state-machine.types';

export function canTransition<S extends string>(
  map: TransitionMap<S>,
  from: S,
  to: S,
): boolean {
  const allowed = map[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export function assertTransition<S extends string>(
  map: TransitionMap<S>,
  from: S,
  to: S,
  errorFactory?: () => Error,
) {
  if (!canTransition(map, from, to)) {
    throw errorFactory?.() ?? new Error(`Invalid transition: ${from} -> ${to}`);
  }
}