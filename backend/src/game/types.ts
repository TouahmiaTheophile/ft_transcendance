import { GameState, Player, Direction } from "./game.types";

export type ControllerKind = 'human1' | 'human2' | 'random' | 'smart';

export interface PlayerConfig {
    id: string;
    kind: ControllerKind;
    startX: number;
    startY: number;
    startDirection: Direction;
    color: string;
    label: string;
}

export interface AIController {
    decide(player: Player, state: GameState): Direction;
}
