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

//moteur du jeu
//gérer les regles : positions traces collisions
export class GameEngine
{
    readonly width: number;
    readonly height: number;
    private players: Map<string, Player>;
    private trails: Set<string>; //chaque case occupée est stockée sous la forme "x,y"

    constructor(width: number, height: number)
    {
        this.width = width;
        this.height = height;
        this.players = new Map();
        this.trails = new Set();
    }

    addPlayer(id: string, x: number, y: number, direction: Direction): void
    {
        const player: Player = { id, x, y, direction, alive: true };
        this.players.set(id, player);
        //case de départ est immédiatement une trace : on ne peut pas y revenir
        this.trails.add(`${x},${y}`);
    }

    applyInput(playerId: string, direction: Direction): void
    {
        const player = this.players.get(playerId);
        if (!player || !player.alive)
            return;
        const opposite: Record<Direction, Direction> =
        {
            UP: 'DOWN',
            DOWN: 'UP',
            LEFT: 'RIGHT',
            RIGHT: 'LEFT',
        };
        if (direction !== opposite[player.direction])
            player.direction = direction;
    }

    //avance la simulation, resol en 3 phases pour gerer les cas de colision tete tete (les 2 meurent)
    tick(): void
    {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.alive);

        //calcule prochaines positions sans rien boug
        const moves: { player: Player; nx: number; ny: number }[] = [];
        for (const player of alivePlayers)
        {
            let nx = player.x;
            let ny = player.y;
            switch (player.direction)
            {
                case 'UP':    ny--; break;
                case 'DOWN':  ny++; break;
                case 'LEFT':  nx--; break;
                case 'RIGHT': nx++; break;
            }
            moves.push({ player, nx, ny });
        }

        //mort par mur ou par trace existante
        for (const { player, nx, ny } of moves)
        {
            if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height)
                player.alive = false;
            else if (this.trails.has(`${nx},${ny}`))
                player.alive = false;
        }

        //mort par collision frontale (deux joueurs visent mm case)
        const targetCells = new Map<string, Player[]>();
        for (const { player, nx, ny } of moves)
        {
            if (!player.alive) continue;
            const key = `${nx},${ny}`;
            if (!targetCells.has(key)) targetCells.set(key, []);
            targetCells.get(key)!.push(player);
        }
        for (const [, players] of targetCells)
        {
            if (players.length > 1)
            {
                //2ko
                for (const p of players) p.alive = false;
            }
        }

        //deplacement des survivants (et ajout trace)
        for (const { player, nx, ny } of moves)
        {
            if (player.alive)
            {
                this.trails.add(`${nx},${ny}`);
                player.x = nx;
                player.y = ny;
            }
        }
    }

    getState(): GameState
    {
        return {
            width: this.width,
            height: this.height,
            players: Array.from(this.players.values()),
            trails: Array.from(this.trails),
        };
    }
}
