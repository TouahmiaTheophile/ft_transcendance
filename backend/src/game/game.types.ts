export type Direction = 'UP'
                        | 'DOWN'
                        | 'LEFT'
                        | 'RIGHT';

export interface Player
{
    id: string;
    x: number;
    y: number;
    direction: Direction;
    alive: boolean;
}

export interface GameState
{
    width: number;
    height: number;
    players: Player[];
    trails: string[];
}