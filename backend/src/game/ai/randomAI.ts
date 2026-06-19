import { AIController } from '../types';
import { Player, GameState, Direction } from '../game.types';

function opposite(d: Direction): Direction {
  return d === 'UP' ? 'DOWN' : d === 'DOWN' ? 'UP' : d === 'LEFT' ? 'RIGHT' : 'LEFT';
}

export class RandomAI implements AIController {
  decide(player: Player, state: GameState): Direction {
    const candidates: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    // avoid reversing
    const filtered = candidates.filter(d => d !== opposite(player.direction));

    // naive safety check: remove moves that immediately hit wall or trail
    const safe: Direction[] = [];
    for (const d of filtered) {
      let nx = player.x;
      let ny = player.y;
      switch (d) {
        case 'UP': ny--; break;
        case 'DOWN': ny++; break;
        case 'LEFT': nx--; break;
        case 'RIGHT': nx++; break;
      }
      const key = `${nx},${ny}`;
      const hits = state.trails.includes(key) || nx < 0 || ny < 0 || nx >= state.width || ny >= state.height;
      if (!hits) safe.push(d);
    }

    const pool = safe.length > 0 ? safe : filtered;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
