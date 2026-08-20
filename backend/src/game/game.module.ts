import { Module } from '@nestjs/common';
import { GameService } from './game.service';

// 1 seul module fournit GameService et l'exporte.
// tous ceux qui importent GameModule partagent mm instance
// (mm map playerGame) fix "Game not found" :
// avant 2 instance probleme avec les inputs + la partie
@Module({
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
