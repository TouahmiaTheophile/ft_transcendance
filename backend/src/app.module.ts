import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { ChatModule } from './chat/chat.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { GameService } from './game/game.service';
import { GameGateway } from './websocket/gateways/game.gateway';
import { LobbyModule } from './lobby/lobby.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    FriendsModule,
    ChatModule,
    CleanupModule,
    LobbyModule,
  ],
  providers: [
    GameService,
    GameGateway,
  ],
})
export class AppModule {}