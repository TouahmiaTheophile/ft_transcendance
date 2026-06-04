import type { Direction, Player, GameState } from './gameEngine';
import type { AIController } from './types';
import { getCandidateDirections, isImmediateDeath, countSteps } from './helpers';

//personalite SAI (SmartAI - pas si smart pour le coup mais bon) c'est son ptit nom sai

//chaque instance de SAI a une personn diff, evite que toutes les SAI jouent pareil.
//
//   straightBias   : à quel point l'IA préfère continuer tout droit (0 = indifférent, 5 = têtu)
//   randomness     : probabilité de faire un choix complètement aléatoire (0 = jamais, 0.2 = parfois)
//   fearThreshold  : distance minimale avant de commencer à paniquer (5 = téméraire, 15 = prudent)
export interface Personality {
    straightBias: number;
    randomness: number;
    fearThreshold: number;
}

//gen une personnalité aléatoire.call au moment de la const si aucune personn en argument.
export function randomPersonality(): Personality {
    return {
        straightBias:   Math.floor(Math.random() * 6),        //0 à 5
        randomness:     Math.random() * 0.2,                   //0% à 20%
        fearThreshold:  5 + Math.floor(Math.random() * 11),   //5 à 15
    };
}

//SmartAI

//IA "intelligente", elle pas de pathfinding complexe, mais elle se suicide pas non plus tout le temps

//fonction en 3et
//   eliminer les directions suicidaires (mur ou trace au prochain tick).
//   parfois (selon randomness), choisir au hasard parmi les directions sûres.
//   sinon, scorer chaque direction sûre et prendre la meilleure :
//        score = cases libres devant
//              + bonus si on continue tout droit (straightBias)
//              + bruit aléatoire pour casser les ex-æquo
//              - pen si c'est un cul-de-sac (fearThreshold)
export class SmartAI implements AIController {
    public personality: Personality;

    constructor(personality?: Personality) {
        this.personality = personality ?? randomPersonality();
    }

    decide(player: Player, state: GameState): Direction {
        const profile = this.personality;
        const candidates = getCandidateDirections(player.direction);

        //on ne considère que les directions qui ne tuent pas immédiatement
        const safeCandidates = candidates.filter(
            dir => !isImmediateDeath(player.x, player.y, dir, state),
        );
        if (safeCandidates.length === 0) {
            //accule de toutes parts : continuer tout droit (mort inévitable, on abrege (a voir ptet degager))
            return player.direction;
        }

        //randomness
        if (Math.random() < profile.randomness) {
            return safeCandidates[Math.floor(Math.random() * safeCandidates.length)]!;
        }

        //score directions et on prend la meilleure
        let bestDir = safeCandidates[0]!;
        let bestScore = -Infinity;
        for (const dir of safeCandidates) {
            const baseSteps = countSteps(player.x, player.y, dir, state);
            const bias  = (dir === player.direction) ? profile.straightBias : 0;
            const noise = Math.random() * 2 - 1; //petit bruit pour briser les egal
            let score   = baseSteps + bias + noise;

            //si dir = culdesac trop court, pen fort
            if (baseSteps < profile.fearThreshold) {
                score -= (profile.fearThreshold - baseSteps) * 2;
            }

            if (score > bestScore) {
                bestScore = score;
                bestDir   = dir;
            }
        }
        return bestDir;
    }
}
