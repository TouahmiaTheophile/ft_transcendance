import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env (DB_USER, etc.)
    UsersModule,
    AuthModule,
    FriendsModule,
  ],
})
export class AppModule {
constructor() {
  console.log('AppModule INIT');
}
}
