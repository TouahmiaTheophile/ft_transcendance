export type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT"
export type P = { id: string; x: number; y: number; direction: Dir; alive: boolean }
export type State = { width: number; height: number; players: P[]; trails: string[] }
export type Status = "idle" | "playing" | "over"

export const CELL = 18
export const COLORS = ["#22d3ee", "#e879c9", "#a3e635", "#fbbf24"]
