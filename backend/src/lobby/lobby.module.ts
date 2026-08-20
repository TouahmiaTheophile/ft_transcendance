import { Module } from "@nestjs/common";
import { LobbyController } from "./lobby.controller";
import { LobbyService } from "./lobby.service";
import { GameModule } from "src/game/game.module";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [UsersModule, GameModule],
  controllers: [LobbyController],
  providers: [
	LobbyService,
  ],
  exports: [LobbyService],
})
export class LobbyModule {}
