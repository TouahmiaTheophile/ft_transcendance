import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';

import { Server, Socket } from 'socket.io';
import { LobbyService } from 'src/lobby/lobby.service';
import { PlayerInputDto } from '../dto/game.dto';
import { GameService } from 'src/game/game.service';
import { Lobby } from 'src/lobby/entities/lobby.entity';
import { RealtimeService } from '../realtime.service';

@WebSocketGateway({
  cors: {
    origin: [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://localhost',
    'https://127.0.0.1',
  ],
    credentials: true,
  },
})
export class GameGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private lobbyService: LobbyService,
    private gameService: GameService,
    private realtimeService: RealtimeService,
  ) {
    this.gameService.events.on('state', ({ gameId, state }) => {
      if (this.server) {
        this.server.to(`game:${gameId}`).emit('game:state', state);
      }
    });
    this.gameService.events.on('game.countdown', ({ gameId, value }) => {
      if (this.server) {
        this.server.to(`game:${gameId}`).emit('game:countdown', { value });
      }
    });
  }

  afterInit(server: Server) {
    this.realtimeService.setServer(server);
  }

  @SubscribeMessage('start_game')
  handleStartGame(
    @ConnectedSocket() socket: Socket,
  ) {
    const lobbyId = this.lobbyService.requirePlayerLobbyId(socket.data.userId);
    const res = this.lobbyService.startGame(
      socket.data.userId,
    );

    if (res?.gameId) {
      try {
        const lobby = this.lobbyService.requireLobby(lobbyId);
        for (const player of lobby.players) {
          this.server.in(`user:${player.id}`).socketsJoin(`game:${res.gameId}`);
        }
      } catch (err) {
      }
      this.server.to(`lobby:${lobbyId}`).emit('game:started', { gameId: res.gameId });

    }

    return res;
  }

  @SubscribeMessage('invite_to_lobby')
  inviteToLobby(
    @ConnectedSocket() socket: Socket,
    @MessageBody('targetId') targetId: number,
  ) {
    const userId = socket.data.userId;
    const lobby = this.lobbyService.requirePlayerLobby(userId);
    lobby.assertCanInvite(userId, targetId);

    this.server.to(`user:${targetId}`).emit('invite_to_lobby', { lobbyId: lobby.id, inviterId: userId });
  }

  @SubscribeMessage('player_input')
  handlePlayerInput(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: PlayerInputDto,
  ) {
    this.gameService.applyInput(
      socket.data.userId,
      dto.direction,
    );
  }

  @SubscribeMessage('lobby:subscribe')
  handleLobbySubscribe(
    @ConnectedSocket() socket: Socket,
    @MessageBody('lobbyId') lobbyId: string,
  ) {
    const lobby = this.lobbyService.requireLobby(lobbyId);
    socket.join(`lobby:${lobbyId}`);
    socket.emit('lobby.state', lobby.toDto());
  }

  updateLobby(lobby: Lobby) {
    this.server.to(`lobby:${lobby.id}`)
      .emit(
        'lobby.state',
        lobby.toDto()
      );
  }

  @OnEvent('lobby.changed')
  handleLobbyChanged(lobby: Lobby) {
    this.server
      .to(`lobby:${lobby.id}`)
      .emit('lobby.state', lobby.toDto());
  }

  @OnEvent('lobby.joined')
  handleLobbyJoined(event: { lobby: Lobby; userId: number }) {

    this.server
      .to(`user:${event.userId}`)
      .socketsJoin(`lobby:${event.lobby.id}`);

    this.updateLobby(event.lobby);
  }

  @OnEvent('lobby.left')
  handleLobbyLeft(event: { lobby: Lobby; userId: number }) {
    this.server
      .in(`user:${event.userId}`)
      .socketsLeave(`lobby:${event.lobby.id}`);

    try {
      this.updateLobby(event.lobby);
    } catch (err) {
    }
  }

}
