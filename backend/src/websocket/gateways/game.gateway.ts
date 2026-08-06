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
    // subscribe to game state updates and broadcast to game rooms
    this.gameService.events.on('state', ({ gameId, state }) => {
      if (this.server) {
        this.server.to(`game:${gameId}`).emit('game:state', state);
      }
    });
    // relaie compte à rebours serveur vers room jeu
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

    // add all connected sockets for each player to the game room
    if (res?.gameId) {
      try {
        const lobby = this.lobbyService.requireLobby(lobbyId);
        for (const player of lobby.players) {
          // all sockets that joined `user:${player.id}` will be made join `game:{gameId}`
          this.server.in(`user:${player.id}`).socketsJoin(`game:${res.gameId}`);
        }
      } catch (err) {
        // ignore if lobby cannot be retrieved here
      }
      // front (page lobby) écoute 'game:started' et redirige vers /game.
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

  // TEMP: lets a client (re)join the lobby room and get the current snapshot.
  // Sending the snapshot here also survives page refresh, where no lobby.joined fires.
  @SubscribeMessage('lobby:subscribe')
  handleLobbySubscribe(
    @ConnectedSocket() socket: Socket,
    @MessageBody('lobbyId') lobbyId: string,
  ) {
    const lobby = this.lobbyService.requireLobby(lobbyId);
    socket.join(`lobby:${lobbyId}`);           // join room first, so no update is missed
    socket.emit('lobby.state', lobby.toDto()); // snapshot to this socket only
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
    // remove all sockets associated with the given user from the lobby room
    this.server
      .in(`user:${event.userId}`)
      .socketsLeave(`lobby:${event.lobby.id}`);

    // update remaining clients about lobby state
    try {
      this.updateLobby(event.lobby);
    } catch (err) {
      // ignore
    }
  }

}