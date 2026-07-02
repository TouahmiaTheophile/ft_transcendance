import { Body, Controller, Get, Post, Query, UseGuards, ParseIntPipe }from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { AccessTokenPayload } from "src/auth/types/access-token-payload.type";
import { LobbyService } from "./lobby.service";

@Controller('lobby')
export class LobbyController {
  constructor(private lobbyService: LobbyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createLobby(
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const lobby = await this.lobbyService.createLobby(user.sub);
    return lobby.toDto();
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  async joinLobby(
    @CurrentUser() user: AccessTokenPayload,
    @Body('lobbyId') lobbyId: string,
  ) {
    await this.lobbyService.joinLobby(lobbyId, user.sub);
    const lobby = this.lobbyService.requireLobby(lobbyId);
    return lobby.toDto();
  }

  @Post('leave')
  @UseGuards(JwtAuthGuard)
  leaveLobby(
    @CurrentUser() user: AccessTokenPayload,
  ) {
    this.lobbyService.leaveLobby(user.sub);
    return { success: true };
  }

  @Post('eject')
  @UseGuards(JwtAuthGuard)
  ejectFromLobby(
    @CurrentUser() user: AccessTokenPayload,
    @Body('targetId') targetId: number,
  ) {
    this.lobbyService.ejectFromLobby(user.sub, targetId);
    return { success: true };
  }

  @Post('add-bot')
  @UseGuards(JwtAuthGuard)
  addBot(
    @CurrentUser() user: AccessTokenPayload,
    @Body('kind') kind: 'random' | 'smart',
  ) {
    const botId = this.lobbyService.addBotToLobby(user.sub, kind);
    return { botId };
  }

  @Get('joinable')
  getJoinableLobbies(
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.lobbyService.getJoinableLobbies(limit);
  }

  @Get('state')
  getLobbyState(
    @Body('lobbyId') lobbyId: string,
  ) {
    return this.lobbyService.getState(lobbyId);
  }
}