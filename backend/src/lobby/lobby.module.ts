import { Module } from "@nestjs/common";
import { LobbyController } from "./lobby.controller";
import { LobbyService } from "./lobby.service";
import { GameService } from "src/game/game.service";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [LobbyController],
  providers: [
	LobbyService,
	GameService,
  ],
  exports: [LobbyService],
})
export class LobbyModule {}