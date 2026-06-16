import { Direction, GameState } from './game.types';

export function turnLeft(dir: Direction): Direction {
  switch (dir) {
    case 'UP':    return 'LEFT';
    case 'LEFT':  return 'DOWN';
    case 'DOWN':  return 'RIGHT';
    case 'RIGHT': return 'UP';
  }
}

export function turnRight(dir: Direction): Direction {
  switch (dir) {
    case 'UP':    return 'RIGHT';
    case 'RIGHT': return 'DOWN';
    case 'DOWN':  return 'LEFT';
    case 'LEFT':  return 'UP';
  }
}

export function getCandidateDirections(current: Direction): Direction[] {
  return [current, turnLeft(current), turnRight(current)];
}

export function isImmediateDeath(
  x: number,
  y: number,
  dir: Direction,
  state: GameState,
): boolean {
  let nx = x, ny = y;
  switch (dir) {
    case 'UP':    ny--; break;
    case 'DOWN':  ny++; break;
    case 'LEFT':  nx--; break;
    case 'RIGHT': nx++; break;
  }
  if (nx < 0 || nx >= state.width || ny < 0 || ny >= state.height) return true;
  return state.trails.includes(`${nx},${ny}`);
}

export function countSteps(
  startX: number,
  startY: number,
  dir: Direction,
  state: GameState,
): number {
  let x = startX, y = startY;
  let steps = 0;
  while (steps < 60) {
    switch (dir) {
      case 'UP':    y--; break;
      case 'DOWN':  y++; break;
      case 'LEFT':  x--; break;
      case 'RIGHT': x++; break;
    }
    if (x < 0 || x >= state.width || y < 0 || y >= state.height) break;
    if (state.trails.includes(`${x},${y}`)) break;
    steps++;
  }
  return steps;
}
