import * as readline from 'node:readline';
import type { GameEngine } from './gameEngine';
import { turnLeft, turnRight } from './helpers';

//gestion du clavier pour 1 ou 2 joueurs humains.

//touches :
//   J1 >  gauche /  droite
//   J2 > 'a' ou 'q' (gauche) / 'd' (droite)

export interface KeyboardOptions {
    humanId1?: string; //id du j1 (fleche)
    humanId2?: string; //id du j2 (a/q + d)
}

export function setupKeyboard(engine: GameEngine, options: KeyboardOptions): void {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true); //recup chaque touche sans attendre "Entre"
    }
    process.stdin.resume();

    process.stdin.on('keypress', (_str, key) => {
        if (!key) return;

        //sortie propre
        if (key.ctrl && key.name === 'c') process.exit();
        if (key.name === 'escape')        process.exit();

        const state = engine.getState();

        //J1
        if (options.humanId1) {
            const p1 = state.players.find(p => p.id === options.humanId1);
            if (p1 && p1.alive) {
                if (key.name === 'left')  engine.applyInput(p1.id, turnLeft(p1.direction));
                if (key.name === 'right') engine.applyInput(p1.id, turnRight(p1.direction));
            }
        }

        //J2
        if (options.humanId2) {
            const p2 = state.players.find(p => p.id === options.humanId2);
            if (p2 && p2.alive) {
                if (key.name === 'a' || key.name === 'q') engine.applyInput(p2.id, turnLeft(p2.direction));
                if (key.name === 'd')                      engine.applyInput(p2.id, turnRight(p2.direction));
            }
        }
    });
}
