import type { Direction, Player, GameState } from './gameEngine';

//quatre types de contrôleurs possibles.
//'human1' et 'human2' au clavier (humanPlayer.ts).
//'random' et 'smart' IA (randomAI.ts et smartAI.ts).
export type ControllerKind = 'human1' | 'human2' | 'random' | 'smart';

//tout ce qu'il faut savoir sur un joueur pour l'instancier et l'afficher
export interface PlayerConfig {
    id: string;              //identifiant unique, ex: "p1"
    kind: ControllerKind;
    startX: number;
    startY: number;
    startDirection: Direction;
    color: string;           //code couleur ANSI, ex: '\x1b[34m'
    label: string;           //nom affiché dans la barre de statut
}

//Interface que toute IA doit implémenter
//À chaque tick : le moteur ask IA quelle dir
//humains n'implémentent pas cette interface : inputs asynchrone via clavier (humanPlayer.ts).
export interface AIController {
    decide(player: Player, state: GameState): Direction;
}
