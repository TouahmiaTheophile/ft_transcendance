import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { ChatModule } from './chat/chat.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { GameModule } from './game/game.module';
import { GameGateway } from './websocket/gateways/game.gateway';
import { LobbyModule } from './lobby/lobby.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WsAuthGateway } from './websocket/gateways/ws-auth.gateway';
import { PresenceService } from './websocket/presence.service';
import { RealtimeService } from './websocket/realtime.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    FriendsModule,
    ChatModule,
    CleanupModule,
    EventEmitterModule.forRoot(),
    LobbyModule,
    GameModule,
  ],
  providers: [
    WsAuthGateway,
    RealtimeService,
    GameGateway,
  ],
})
export class AppModule {}
