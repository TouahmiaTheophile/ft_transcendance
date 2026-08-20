import { GameInstance, GameOptions } from "./gameInstance.entity";
import { Direction, GameState } from "./game.types";
import { AIController } from "./types";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RandomAI } from './ai/randomAI';
import { SmartAI } from './ai/smartAI';
import { ApiErrors } from "src/common/errors/api-exceptions.helper";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GameService {
  private games = new Map<string, GameInstance>();
  private playerGame = new Map<number, string>();
  public events: EventEmitter2;

  constructor(private eventEmitter: EventEmitter2) {
    this.events = eventEmitter;
  }

  startGame(config: GameOptions, controllers: Map<string, AIController>) {
    for (const p of config.players) {
      if (this.playerGame.has(Number(p.id)))
        throw ApiErrors.conflict("Player already in a game");
    }

    const ctrls = new Map<string, AIController>(controllers);
    for (const p of config.players) {
      if (!ctrls.has(p.id)) {
        if (p.kind === 'random') ctrls.set(p.id, new RandomAI());
        else if (p.kind === 'smart') ctrls.set(p.id, new SmartAI());
      }
    }

    let game!: GameInstance;
    game = new GameInstance(
      config,
      ctrls,
      () => this.cleanupGame(game.id),
      (state: GameState) => this.events.emit('state', { gameId: game.id, state }),
    );

    this.games.set(game.id, game);

    for (const p of config.players) {
      this.playerGame.set(Number(p.id), game.id);
    }

    const COUNTDOWN_S = 3;
    let remaining = COUNTDOWN_S;
    this.events.emit('state', { gameId: game.id, state: game.getState() });
    this.events.emit('game.countdown', { gameId: game.id, value: remaining });
    const timer = setInterval(() => {
      if (!this.games.has(game.id)) return clearInterval(timer);
      remaining--;
      this.events.emit('game.countdown', { gameId: game.id, value: remaining });
      if (remaining === 0) {
        clearInterval(timer);
        game.start();
      }
    }, 1000);

    return game;
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

    const players = game.getState().players;
    for (const p of players) {
      this.playerGame.delete(Number(p.id));
    }

    this.games.delete(gameId);
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
