import type { GameEngine } from './gameEngine';
import type { PlayerConfig } from './types';

const RESET = '\x1b[0m';

//affiche grille dans terminal

//quand un joueur meurt sa trace doit garde sa couleur (on peut changer a voir si on passe a du neutre ou si on enleve a debatre)
//si on attend après tick, le joueur mort n'aurait plus de couleur associée (si option au dessus ?)
export class Renderer {
    private readonly engine: GameEngine;
    private readonly configs: PlayerConfig[];
    private readonly configById: Map<string, PlayerConfig>;
    private readonly trailColors: Map<string, string> = new Map(); //"x,y" -> code couleur ANSI

    constructor(engine: GameEngine, configs: PlayerConfig[]) {
        this.engine = engine;
        this.configs = configs;
        this.configById = new Map(configs.map(c => [c.id, c]));
    }

    //appeler AVANT chaque engine.tick().
    //enregistre la couleur de la case actuelle de chaque joueur vivant :
    //case va devenir une trace au prochain tick
    captureTrailColors(): void {
        const state = this.engine.getState();
        for (const p of state.players) {
            if (!p.alive) continue;
            const key = `${p.x},${p.y}`;
            if (this.trailColors.has(key)) continue; //deja mem, on écrase pas
            const cfg = this.configById.get(p.id);
            this.trailColors.set(key, cfg?.color ?? '\x1b[90m');
        }
    }

    render(): void {
        const state = this.engine.getState();

        //grille vide : chaque cellule commence à ' '
        const grid: string[][] = Array.from(
            { length: state.height },
            () => Array(state.width).fill(' '),
        );

        //remplir les traces avec leur couleur mémorisée
        for (const t of state.trails) {
            const [xStr, yStr] = t.split(',');
            const x = Number(xStr);
            const y = Number(yStr);
            if (grid[y]?.[x] === ' ') {
                const color = this.trailColors.get(t) ?? '\x1b[90m';
                grid[y]![x] = `${color}█${RESET}`;
            }
        }

        //joueurs vivants par dessus traces (@= tête)
        for (const p of state.players) {
            if (!p.alive) continue;
            const cfg = this.configById.get(p.id);
            const color = cfg?.color ?? '\x1b[33m';
            grid[p.y]![p.x] = `${color}@${RESET}`;
        }

        //affichage : on efface le terminal = un rendu "in-place" (a retoucher pour final)
        console.clear();
        console.log('+' + '-'.repeat(state.width) + '+');
        for (const row of grid) console.log('|' + row.join('') + '|');
        console.log('+' + '-'.repeat(state.width) + '+');

        //barre de statut : un indicateur par joueur (OK / X) (on peut supr plus tard ou garder)
        const statusParts: string[] = [];
        for (const cfg of this.configs) {
            const p = state.players.find(pl => pl.id === cfg.id);
            const tag = p?.alive ? 'OK' : 'X ';
            statusParts.push(`${cfg.color}${cfg.label}${RESET} [${tag}]`);
        }
        console.log('\n' + statusParts.join('   '));
        console.log('Joueur 1 : <- ->   |   Joueur 2 : a/q  d   |   Quitter : ESC ou Ctrl+C');
    }

    announceWinner(): void {
        const state = this.engine.getState();
        const alive = state.players.filter(p => p.alive);
        if (alive.length === 0) {
            console.log('\nMatch nul !\n');
            return;
        }
        const winner = alive[0]!;
        const cfg    = this.configById.get(winner.id);
        const color  = cfg?.color ?? '\x1b[33m';
        const label  = cfg?.label ?? winner.id;
        console.log(`\n${color}${label}${RESET} a gagné !\n`);
    }
}
