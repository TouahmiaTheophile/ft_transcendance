import { GameInstance, GameOptions } from "./gameInstance.entity";
import { Direction, GameState } from "./game.types";
import { AIController } from "./types";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RandomAI } from './ai/randomAI';
import { SmartAI } from './ai/smartAI';
import { ApiErrors } from "src/common/errors/api-exceptions.helper";
import { Injectable } from "@nestjs/common";

// -rbauerMod7- Temps maximum d'attente des clics "Play" avant de lancer la
// partie d'office. Assez long pour lire les huit règles du tutoriel sans
// stress, assez court pour qu'un joueur parti sans prévenir ne bloque pas le
// lobby indéfiniment.
const READY_TIMEOUT_MS = 120_000; // 2 minutes

@Injectable()
export class GameService {
  private games = new Map<string, GameInstance>();
  private playerGame = new Map<number, string>();
  public events: EventEmitter2;

  // -rbauerMod7- Parties créées mais pas encore lancées : elles attendent que
  // les joueurs humains cliquent "Play" sur la page de jeu (le temps de lire le
  // tutoriel). Une entrée par partie, supprimée dès que le 3-2-1 démarre.
  //   waiting : les ids humains dont on attend encore le clic
  //   total   : combien d'humains au départ (pour afficher "1/2 prêts")
  //   timer   : filet de sécurité, voir READY_TIMEOUT_MS
  private pendingStart = new Map<
    string,
    { waiting: Set<number>; total: number; timer: NodeJS.Timeout }
  >();

  constructor(private eventEmitter: EventEmitter2) {
    this.events = eventEmitter;
  }

  startGame(config: GameOptions, controllers: Map<string, AIController>) {
    for (const p of config.players) {
      if (this.playerGame.has(Number(p.id)))
        throw ApiErrors.conflict("Player already in a game");
    }

    // Build controllers map (use provided controllers as base)
    const ctrls = new Map<string, AIController>(controllers);
    for (const p of config.players) {
      if (!ctrls.has(p.id)) {
        if (p.kind === 'random') ctrls.set(p.id, new RandomAI());
        else if (p.kind === 'smart') ctrls.set(p.id, new SmartAI());
      }
    }

    // For bot players represented by negative numeric ids, also map their numeric ids in playerGame

    let game!: GameInstance;
    game = new GameInstance(
      config,
      ctrls,
      () => this.cleanupGame(game.id),
      (state: GameState) => this.events.emit('state', { gameId: game.id, state }),
    );

    this.games.set(game.id, game);

    // IMPORTANT: mapping players → game
    for (const p of config.players) {
      // allow bots (negative ids) to be looked up by numeric id
      this.playerGame.set(Number(p.id), game.id);
    }

    // état émis une fois au début : un client qui arrive en retard
    this.events.emit('state', { gameId: game.id, state: game.getState() });

    // -rbauerMod7- Le compte à rebours 3-2-1 ne part PLUS d'ici.
    //
    // Avant : "start_game" -> 3 secondes -> la partie roule. Le tutoriel de la
    // page de jeu (GameTutorial.tsx) n'était donc lisible que 3 secondes.
    // Maintenant : on enregistre qui doit encore cliquer "Play", et
    // markReady() lance le 3-2-1 quand tout le monde a cliqué. Le moteur ne
    // tique pas d'ici là : personne ne bouge, personne ne meurt, et tous les
    // clients partent synchronisés -- exactement comme avant, mais sans
    // horloge qui court pendant qu'on lit.
    //
    // Les bots ont des ids négatifs (cf. LobbyService.addBotToLobby) : ils
    // n'ont rien à cliquer, seuls les ids positifs sont attendus.
    const humans = config.players
      .map((p) => Number(p.id))
      .filter((id) => id > 0);

    this.pendingStart.set(game.id, {
      waiting: new Set(humans),
      total: humans.length,
      // -rbauerMod7- Filet de sécurité : si un joueur ferme son onglet sans
      // cliquer, sa partie bloquerait tout le lobby pour toujours. Au bout de
      // READY_TIMEOUT_MS on part quand même. Le délai est large exprès : il
      // doit laisser le temps de lire le tutoriel en entier, pas presser.
      timer: setTimeout(() => this.startCountdown(game.id), READY_TIMEOUT_MS),
    });

    // -rbauerMod7- Cas théorique (partie 100% bots) : rien à attendre.
    if (humans.length === 0) this.startCountdown(game.id);

    return game;
  }

  // -rbauerMod7- Un joueur a cliqué "Play" sur la page de jeu.
  //
  // Appelé par le gateway sur l'événement socket "player_ready". On retire le
  // joueur de la liste d'attente, on prévient la room de l'avancement (pour le
  // "en attente des autres joueurs… 1/2" affiché sous le bouton), et quand la
  // liste est vide le 3-2-1 part.
  //
  // Renvoie l'id de la partie du joueur (null s'il n'en a pas) : le gateway
  // s'en sert pour le remettre dans la room socket, cf. son commentaire.
  markReady(userId: number): string | null {
    const gameId = this.playerGame.get(userId);
    if (!gameId) return null; // pas en partie : clic périmé (reload après la fin)

    const pending = this.pendingStart.get(gameId);
    // Pas d'entrée = compte à rebours déjà lancé : rien à marquer, mais la
    // partie existe, donc on renvoie quand même son id.
    if (!pending) return gameId;

    pending.waiting.delete(userId);
    this.events.emit('game.ready', {
      gameId,
      ready: pending.total - pending.waiting.size,
      total: pending.total,
    });

    if (pending.waiting.size === 0) this.startCountdown(gameId);

    return gameId;
  }

  // -rbauerMod7- Le compte à rebours 3-2-1-GO SERVEUR, tel qu'il était dans
  // startGame(). Il est juste déplacé ici pour avoir deux déclencheurs : le
  // dernier "Play" reçu, ou le timeout de sécurité.
  //
  // Idempotent : il consomme l'entrée pendingStart, donc un deuxième appel
  // (timeout qui arrive juste après le dernier clic) ne fait rien.
  private startCountdown(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return; // partie annulée entre-temps

    const pending = this.pendingStart.get(gameId);
    if (!pending) return; // déjà lancé
    clearTimeout(pending.timer);
    this.pendingStart.delete(gameId);

    // moteur tique pas avant la fin -> personne peut bouger/mourir + tous les clients sont syc
    const COUNTDOWN_S = 3;
    let remaining = COUNTDOWN_S;
    this.events.emit('game.countdown', { gameId, value: remaining });
    const timer = setInterval(() => {
      if (!this.games.has(gameId)) return clearInterval(timer); // partie annulée
      remaining--;
      this.events.emit('game.countdown', { gameId, value: remaining });
      if (remaining === 0) {
        clearInterval(timer);
        game.start(); // GO !
      }
    }, 1000);
  }

  requireGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game)
      throw ApiErrors.notFound("Game not found");

    return game;
  }

  stopGame(gameId: string) {
    const game = this.requireGame(gameId);

    game.stop();
    this.cleanupGame(gameId);
  }

  private cleanupGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    // -rbauerMod7- Une partie peut mourir avant d'avoir démarré (tout le monde
    // quitte pendant le tutoriel) : on jette le timer de sécurité, sinon il
    // ferait tourner un setTimeout sur une partie qui n'existe plus.
    const pending = this.pendingStart.get(gameId);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingStart.delete(gameId);
    }

    const players = game.getState().players;
    for (const p of players) {
      this.playerGame.delete(Number(p.id));
    }

    this.games.delete(gameId);
    // fin de partie : LobbyService rouvre le lobby des joueurs
    // permettre de relancer une partie ("retour au lobby")
    this.events.emit('game.ended', {
      playerIds: players.map((p) => Number(p.id)),
    });

  }

  applyInput(userId: number, direction: Direction) {
    const gameId = this.playerGame.get(userId);

    if (!gameId)
      throw ApiErrors.notFound("Game not found");

    const game = this.requireGame(gameId);

    game.applyInput(userId, direction);
  }
}