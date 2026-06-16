import { Injectable } from "@nestjs/common";
import { Lobby } from "./entities/lobby.entity";
import { ApiErrors } from "src/common/errors/api-exceptions.helper";
import { GameService } from "src/game/game.service";
import { GameOptions } from "src/game/gameInstance.entity";
import { Direction } from "src/game/game.types";

@Injectable()
export class LobbyService {
  private lobbies = new Map<string, Lobby>();
  private playerLobby = new Map<number, string>();

  constructor(private gameService: GameService) {}

  createLobby(userId: number) {
    this.resyncPlayerLobby(userId);  // Ensure a user is not stuck by an invalid entry, rm
    if (this.playerLobby.has(userId))
      throw ApiErrors.conflict("You already are in a lobby");

    const lobby = new Lobby(userId);

    this.lobbies.set(lobby.id, lobby);
    this.playerLobby.set(userId, lobby.id);

    return lobby;
  }

  joinLobby(lobbyId: string, userId: number) {
    this.resyncPlayerLobby(userId);  // Ensure a user is not stuck by an invalid entry, rm
    const currentLobbyId = this.playerLobby.get(userId);
    if (currentLobbyId !== undefined) {
      if (currentLobbyId === lobbyId)
        throw ApiErrors.conflict("You already are in this lobby");
      throw ApiErrors.conflict("You must leave your current lobby first");
    }

    const lobby = this.requireLobby(lobbyId);
    lobby.join(userId);
    this.playerLobby.set(userId, lobbyId);
  }

  leaveLobby(userId: number) {
    const lobbyId = this.playerLobby.get(userId);

    if (lobbyId === undefined) {
      throw ApiErrors.conflict('You are not in a lobby');
    }

    const lobby = this.requireLobby(lobbyId);

    if (lobby.leave(userId))
      this.lobbies.delete(lobbyId);
    this.playerLobby.delete(userId);
  }

  ejectFromLobby(ejecterId: number, ejectedId: number) {
    const lobbyId = this.playerLobby.get(ejectedId);
    if (lobbyId === undefined)
      throw ApiErrors.conflict("You are not in a lobby");

    const lobby = this.lobbies.get(lobbyId);
    if (lobby === undefined) {
        this.resyncPlayerLobby(ejectedId);
        this.resyncPlayerLobby(ejecterId);
        throw ApiErrors.notFound("Lobby not found");
    }

    if (lobby.eject(ejecterId, ejectedId))
      this.lobbies.delete(lobby.id);  // shouldn't happen for now, this prevents future oversights
    this.playerLobby.delete(ejectedId);
  }

  startGame(requesterId: number) {
    const lobby = this.requirePlayerLobby(requesterId);

    lobby.assertCanStart(requesterId);

    const players = lobby.players;
    if (players.length < 2)
      throw ApiErrors.conflict("A game requires at least 2 players");

    const options: GameOptions = {
      width: 40,
      height: 20,
      tickMs: 150,
      players: players.map((userId, index) => {
        const spawn = this.getSpawnPosition(index, 40, 20);
        return {
          id: userId.toString(),
          kind: index === 1 ? 'human2' : 'human1',
          startX: spawn.x,
          startY: spawn.y,
          startDirection: spawn.dir,
          color: '',
          label: `Player ${userId}`,
        };
      }),
    };

    const game = this.gameService.startGame(options, new Map());

    lobby.inGame();

    return {
      gameId: game.id,
      state: game.getState(),
    };
  }

  private getSpawnPosition(index: number, width: number, height: number) {
    switch (index) {
      case 0:
        return { x: Math.floor(width / 4), y: Math.floor(height / 2), dir: 'RIGHT' as Direction };
      case 1:
        return { x: Math.floor((width * 3) / 4), y: Math.floor(height / 2), dir: 'LEFT' as Direction };
      case 2:
        return { x: Math.floor(width / 2), y: Math.floor(height / 4), dir: 'DOWN' as Direction };
      case 3:
        return { x: Math.floor(width / 2), y: Math.floor((height * 3) / 4), dir: 'UP' as Direction };
      default:
        return { x: 0, y: 0, dir: 'RIGHT' as Direction };
    }
  }

// --------- UTILS -----------

  requireLobby(lobbyId: string) : Lobby {
    const lobby = this.lobbies.get(lobbyId);
    if (lobby === undefined)
      throw ApiErrors.notFound("Lobby not found");

    return lobby;
  }

  requirePlayerLobbyId(userId: number) : string {
    const lobbyId = this.playerLobby.get(userId);
    if (lobbyId === undefined)
      throw ApiErrors.notFound("Current lobby not found");
    return lobbyId;
  }

  requirePlayerLobby(userId: number) : Lobby {
    const LobbyId = this.requirePlayerLobbyId(userId);
    return this.requireLobby(LobbyId);
  }

  resyncPlayerLobby(userId: number) {
    const lobbyId = this.playerLobby.get(userId);
    if (lobbyId === undefined)
      return ;

    const lobby = this.lobbies.get(lobbyId);
    if (lobby === undefined) {
      console.error(`sync error: user ${userId} is associated with missing lobby ${lobbyId}`);
      this.playerLobby.delete(userId);
    } else if (!lobby.contains(userId)) {
      console.error(`sync error: user ${userId} is associated with lobby ${lobbyId} but is not a participant`);
      this.playerLobby.delete(userId);
    }
  }
}
