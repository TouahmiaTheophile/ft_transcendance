import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { LobbyService } from 'src/lobby/lobby.service';
import { PlayerInputDto } from '../dto/game.dto';
import { GameService } from 'src/game/game.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true,
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private lobbyService: LobbyService,
    private gameService: GameService,
  ) {
    // subscribe to game state updates and broadcast to game rooms
    this.gameService.events.on('state', ({ gameId, state }) => {
      if (this.server) {
        this.server.to(`game:${gameId}`).emit('game:state', state);
      }
    });
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
        for (const userId of lobby.players) {
          // all sockets that joined `user:${userId}` will be made join `game:{gameId}`
          this.server.in(`user:${userId}`).socketsJoin(`game:${res.gameId}`);
        }
      } catch (err) {
        // ignore if lobby cannot be retrieved here
      }
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
}