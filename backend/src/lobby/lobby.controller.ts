import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { AccessTokenPayload } from "src/auth/types/access-token-payload.type";
import { LobbyService } from "./lobby.service";

@Controller('lobby')
export class LobbyController {
  constructor(private lobbyService: LobbyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createLobby(
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const lobby = this.lobbyService.createLobby(user.sub);
    return { lobbyId: lobby.id };
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  joinLobby(
    @CurrentUser() user: AccessTokenPayload,
    @Body('lobbyId') lobbyId: string,
  ) {
    this.lobbyService.joinLobby(lobbyId, user.sub);
    return { success: true };
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
}