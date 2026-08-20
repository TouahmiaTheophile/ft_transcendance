import { Player, Direction, GameState } from "./game.types";

const OPPOSITE: Record<Direction, Direction> =
{
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
};

//moteur du jeu
//gérer les regles : positions traces collisions
export class GameEngine
{
    readonly width: number;
    readonly height: number;
    private players: Map<string, Player>;
    private trails: Set<string>; //chaque case occupée est stockée sous la forme "x,y"

    //file d'attente des inputs, un seul est consommé par tick
    // deux touches envoyées entre deux ticks se cumulent et font un demi-tour :
    private pendingInputs: Map<string, Direction[]>;

    //ignore : evite qu'un joueur qui bourrine se retrouve
    //avec des virages en retard de plusieurs ticks
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
        //case de départ est immédiatement une trace : on ne peut pas y revenir
        this.trails.add(`${x},${y}`);
    }

    //empile au lieu d'ecrire player.direction. Validation contre la derniere
    //intention en file : sinon deux virages dans le meme tick contournent la
    //garde anti demi-tour (RIGHT + UP + LEFT => LEFT, on rentre dans sa trace).
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

        //rien a faire (touche maintenue / repetition clavier)
        if (direction === reference)
            return;
        //demi-tour interdit
        if (direction === OPPOSITE[reference])
            return;

        queue.push(direction);
    }

    //consomme au plus un input par joueur, juste avant de calculer les mouvements
    private consumePendingInputs(alivePlayers: Player[]): void
    {
        for (const player of alivePlayers)
        {
            const queue = this.pendingInputs.get(player.id);
            if (!queue || queue.length === 0)
                continue;

            const next = queue.shift()!;
            //re-verification defensive : la file a deja ete validee a l'empilage
            if (next !== OPPOSITE[player.direction])
                player.direction = next;
        }
    }

    //avance la simulation, resol en 3 phases pour gerer les cas de colision tete tete (les 2 meurent)
    tick(): void
    {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.alive);

        //applique les virages en attente (un seul par joueur)
        this.consumePendingInputs(alivePlayers);

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

        //on vide la file des morts, plus rien a rejouer
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
