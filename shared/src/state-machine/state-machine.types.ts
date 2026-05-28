export type TransitionMap<S extends string> = {
  [K in S]?: S[];
};