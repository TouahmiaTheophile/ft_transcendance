import type { Direction, Player, GameState } from './gameEngine';
import type { AIController } from './types';
import { turnLeft, turnRight } from './helpers';

//IA DEBILE NOMMER le bot DIA ? A VOIR PLUS tard lol
//turnProbability controle agitation :
//   0.4 (default) -> 20% gauche / 20% droite / 60% tout droit
//   0.6          -> 30% gauche / 30% droite / 40% tout droit
export class RandomAI implements AIController {
    private readonly turnProbability: number;

    constructor(turnProbability: number = 0.4) {
        this.turnProbability = turnProbability;
    }

    decide(player: Player, _state: GameState): Direction {
        const r = Math.random();
        const half = this.turnProbability / 2;
        if (r < half)                    return turnLeft(player.direction);
        if (r < this.turnProbability)    return turnRight(player.direction);
        return player.direction; //tout droit
    }
}
