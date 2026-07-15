import { GameEngine } from './gameEngine';
import type { AIController, ControllerKind, PlayerConfig } from './types';
import { Renderer } from './renderer';
import { setupKeyboard, KeyboardOptions } from './humanPlayer';
import { RandomAI } from './randomAI';
import { SmartAI } from './smartAI';

export interface GameOptions {
    width: number;
    height: number;
    tickMs: number;
    players: PlayerConfig[];
}

//instancie le bon contrôleur selon le type
//humains renvoient null pas de controleur ai
//input clavier setupKeyboard().
function makeController(kind: ControllerKind): AIController | null {
    switch (kind) {
        case 'human1':
        case 'human2': return null;
        case 'random': return new RandomAI();
        case 'smart':  return new SmartAI();
    }
}

//fait tourner une partie complète.
//orchestrateur : boucle setInterval jusqu'a ce plus qu1 survivant
export function runGame(options: GameOptions): void {
    const { width, height, tickMs, players } = options;

    //moteur de jeu+ enregistrement de chaque joueur
    const engine = new GameEngine(width, height);
    for (const cfg of players) {
        engine.addPlayer(cfg.id, cfg.startX, cfg.startY, cfg.startDirection);
    }

    //contrleurs IA (1/non human player)
    const controllers = new Map<string, AIController>();
    for (const cfg of players) {
        const ctrl = makeController(cfg.kind);
        if (ctrl) controllers.set(cfg.id, ctrl);
    }

    //clavier pour les humains
    //(requis par exactOptionalPropertyTypes dans le tsconfig).
    const kbOpts: KeyboardOptions = {};
    const h1 = players.find(p => p.kind === 'human1');
    const h2 = players.find(p => p.kind === 'human2');
    if (h1) kbOpts.humanId1 = h1.id;
    if (h2) kbOpts.humanId2 = h2.id;
    setupKeyboard(engine, kbOpts);

    //render
    const renderer = new Renderer(engine, players);

    //boucle principale : un tick toutes les tickMs millisecondes
    const loop = setInterval(() => {
        const state = engine.getState();
        const alive = state.players.filter(p => p.alive);

        //fin 0 = egalite / 1 = 1 joueur viv
        if (alive.length <= 1) {
            renderer.render();
            renderer.announceWinner();
            clearInterval(loop);
            process.exit(0);
        }

        //deci ia
        for (const p of alive) {
            const ctrl = controllers.get(p.id);
            if (!ctrl) continue;
            const newDir = ctrl.decide(p, state);
            engine.applyInput(p.id, newDir);
        }

        //couleurs des traces avnt de tick (voir renderer.ts)
        renderer.captureTrailColors();
        engine.tick();
        renderer.render();
    }, tickMs);

    renderer.render(); //1er rendu immédiat avant le premier tick
}
