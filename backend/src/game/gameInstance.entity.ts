import { GameEngine } from "./game.engine";
import { Direction } from "./game.types";
import { AIController, PlayerConfig } from "./types";

export interface GameOptions {
    width: number;
    height: number;
    tickMs: number;
    players: PlayerConfig[];
}

export class GameInstance {
  private engine: GameEngine;
  private interval?: NodeJS.Timeout;
  readonly id = crypto.randomUUID();

  constructor(
    private config: GameOptions,
    private controllers: Map<string, AIController>,
    private readonly onFinished?: () => void,
    private readonly onTick?: (state: any) => void,
  ) {
    this.engine = new GameEngine(config.width, config.height);

    for (const p of config.players) {
      this.engine.addPlayer(p.id, p.startX, p.startY, p.startDirection);
    }
  }

  start() {
    this.interval = setInterval(() => this.tick(), this.config.tickMs);
  }

  private tick() {
    const state = this.engine.getState();
    const alive = state.players.filter(p => p.alive);

    if (alive.length <= 1) {
      this.stop();
      this.onFinished?.();
      this.onTick?.(this.getState());
      return;
    }

    for (const p of alive) {
      const ctrl = this.controllers.get(p.id);
      if (!ctrl) continue;

      const dir = ctrl.decide(p, state);
      this.engine.applyInput(p.id, dir);
    }

    this.engine.tick();
    this.onTick?.(this.getState());
  }

  stop() {
    if (this.interval)
      clearInterval(this.interval);
  }

  getState() {
    return this.engine.getState();
  }

  applyInput(playerId: number, direction: Direction) {
    this.engine.applyInput(playerId.toString(), direction);
  }
}