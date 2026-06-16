import { AIController } from '../types';
import { Player, GameState, Direction } from '../game.types';
import { getCandidateDirections, isImmediateDeath, countSteps } from '../helpers';

export interface Personality {
  straightBias: number;
  randomness: number;
  fearThreshold: number;
}

export function randomPersonality(): Personality {
  return {
    straightBias:   Math.floor(Math.random() * 6),
    randomness:     Math.random() * 0.2,
    fearThreshold:  5 + Math.floor(Math.random() * 11),
  };
}

export class SmartAI implements AIController {
  public personality: Personality;

  constructor(personality?: Personality) {
    this.personality = personality ?? randomPersonality();
  }

  decide(player: Player, state: GameState): Direction {
    const profile = this.personality;
    const candidates = getCandidateDirections(player.direction);

    const safeCandidates = candidates.filter(
      dir => !isImmediateDeath(player.x, player.y, dir, state),
    );
    if (safeCandidates.length === 0) {
      return player.direction;
    }

    if (Math.random() < profile.randomness) {
      return safeCandidates[Math.floor(Math.random() * safeCandidates.length)]!;
    }

    let bestDir = safeCandidates[0]!;
    let bestScore = -Infinity;
    for (const dir of safeCandidates) {
      const baseSteps = countSteps(player.x, player.y, dir, state);
      const bias  = (dir === player.direction) ? profile.straightBias : 0;
      const noise = Math.random() * 2 - 1;
      let score   = baseSteps + bias + noise;

      if (baseSteps < profile.fearThreshold) {
        score -= (profile.fearThreshold - baseSteps) * 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestDir   = dir;
      }
    }
    return bestDir;
  }
}
