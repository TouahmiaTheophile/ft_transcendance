import { Player, Direction, GameState } from "./game.types";

const OPPOSITE: Record<Direction, Direction> =
{
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
};

export class GameEngine
{
    readonly width: number;
    readonly height: number;
    private players: Map<string, Player>;
    private trails: Set<string>;

    private pendingInputs: Map<string, Direction[]>;

    private static readonly MAX_QUEUED_INPUTS = 2;

    constructor(width: number, height: number)
    {
        this.width = width;
        this.height = height;
        this.players = new Map();
        this.trails = new Set();
        this.pendingInputs = new Map();
    }

    addPlayer(id: string, x: number, y: number, direction: Direction): void
    {
        const player: Player = { id, x, y, direction, alive: true };
        this.players.set(id, player);
        this.pendingInputs.set(id, []);
        this.trails.add(`${x},${y}`);
    }

    applyInput(playerId: string, direction: Direction): void
    {
        const player = this.players.get(playerId);
        if (!player || !player.alive)
            return;

        const queue = this.pendingInputs.get(playerId);
        if (!queue)
            return;
        if (queue.length >= GameEngine.MAX_QUEUED_INPUTS)
            return;

        const reference = queue.length > 0 ? queue[queue.length - 1] : player.direction;

        if (direction === reference)
            return;
        if (direction === OPPOSITE[reference])
            return;

        queue.push(direction);
    }

    private consumePendingInputs(alivePlayers: Player[]): void
    {
        for (const player of alivePlayers)
        {
            const queue = this.pendingInputs.get(player.id);
            if (!queue || queue.length === 0)
                continue;

            const next = queue.shift()!;
            if (next !== OPPOSITE[player.direction])
                player.direction = next;
        }
    }

    tick(): void
    {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.alive);

        this.consumePendingInputs(alivePlayers);

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

        for (const { player, nx, ny } of moves)
        {
            if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height)
                player.alive = false;
            else if (this.trails.has(`${nx},${ny}`))
                player.alive = false;
        }

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
                for (const p of players) p.alive = false;
            }
        }

        for (const { player, nx, ny } of moves)
        {
            if (player.alive)
            {
                this.trails.add(`${nx},${ny}`);
                player.x = nx;
                player.y = ny;
            }
        }

        for (const { player } of moves)
        {
            if (!player.alive)
                this.pendingInputs.get(player.id)?.splice(0);
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
