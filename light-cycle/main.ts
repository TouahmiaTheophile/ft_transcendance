import * as readline from 'node:readline/promises';
import type { Direction } from './src/gameEngine';
import type { ControllerKind, PlayerConfig } from './src/types';
import { runGame } from './src/game';

// CONFIG GLOBALE
const GRID_WIDTH  = 40;
const GRID_HEIGHT = 20;
const TICK_MS     = 150;

// 4 couleurs
const COLORS = [
    '\x1b[34m', // p1 - bleu
    '\x1b[35m', // p2 - magenta
    '\x1b[92m', // p3 - vert clair
    '\x1b[93m', // p4 - jaune clair
];

const LABELS: Record<ControllerKind, string> = {
    human1: 'Humain 1',
    human2: 'Humain 2',
    random: 'IA Random',
    smart:  'IA Smart',
};

// Pos depart pour chaque slot (a modif si on veut random)
function spawnFor(index: number): { x: number; y: number; dir: Direction } {
    const w = GRID_WIDTH, h = GRID_HEIGHT;
    switch (index) {
        case 0: return { x: Math.floor(w / 4),       y: Math.floor(h / 2),       dir: 'RIGHT' };
        case 1: return { x: Math.floor((w * 3) / 4), y: Math.floor(h / 2),       dir: 'LEFT'  };
        case 2: return { x: Math.floor(w / 2),       y: Math.floor(h / 4),       dir: 'DOWN'  };
        case 3: return { x: Math.floor(w / 2),       y: Math.floor((h * 3) / 4), dir: 'UP'    };
        default: return { x: 0, y: 0, dir: 'RIGHT' };
    }
}

// MENU INTERACTIF (temp)
async function ask(
    rl: readline.Interface,
    question: string,
    valid: string[],
): Promise<string> {
    while (true) {
        const ans = (await rl.question(question)).trim().toLowerCase();
        if (valid.includes(ans)) return ans;
        console.log(`Reponse invalide. Attendu : ${valid.join(' / ')}`);
    }
}

async function buildConfig(): Promise<PlayerConfig[]> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('\n=== LIGHT CYCLE ===\n');
    console.log('Modes :');
    console.log('  1) 1 humain  vs  1 IA');
    console.log('  2) 2 humains (1v1)');
    console.log('  3) 1 humain  vs  2 IA');
    console.log('  4) 1 humain  vs  3 IA');
    console.log('');

    const mode = await ask(rl, 'Choix (1-4) : ', ['1', '2', '3', '4']);

    //liste en mettant 'smart' comme placeholder
    let kinds: ControllerKind[];
    switch (mode) {
        case '1':  kinds = ['human1', 'smart'];                          break;
        case '2':  kinds = ['human1', 'human2'];                         break;
        case '3':  kinds = ['human1', 'smart', 'smart'];                 break;
        case '4':  kinds = ['human1', 'smart', 'smart', 'smart'];        break;
        default:   kinds = ['human1', 'smart'];
    }

    //chaque IA, random ou smart
    let aiCount = 0;
    for (let i = 0; i < kinds.length; i++) {
        if (kinds[i] !== 'smart') continue;
        aiCount++;
        const a = await ask(
            rl,
            `IA #${aiCount} - (r)andom ou (s)mart ? `,
            ['r', 's'],
        );
        kinds[i] = a === 'r' ? 'random' : 'smart';
    }

    rl.close();

    //PlayerConfig finaux
    const configs: PlayerConfig[] = kinds.map((kind, idx) => {
        const spawn = spawnFor(idx);
        return {
            id: `p${idx + 1}`,
            kind,
            startX: spawn.x,
            startY: spawn.y,
            startDirection: spawn.dir,
            color: COLORS[idx]!,
            label: `${LABELS[kind]} (P${idx + 1})`,
        };
    });

    //recap avant de lancer
    console.log('\nConfig de la partie :');
    for (const c of configs) {
        console.log(`  ${c.color}${c.label}\x1b[0m`);
    }
    console.log('\nDemarrage dans 1s...\n');
    await new Promise(r => setTimeout(r, 1000));

    return configs;
}

// MAIN
(async () => {
    const players = await buildConfig();
    runGame({
        width: GRID_WIDTH,
        height: GRID_HEIGHT,
        tickMs: TICK_MS,
        players,
    });
})();
