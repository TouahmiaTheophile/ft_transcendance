import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { AuthController }
  from './auth.controller';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';

import { AccessTokenStrategy }
  from './strategies/access-token.strategy';

import { SessionService } from './session.service';

import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../common/security/security.module';

@Module({
  imports: [
    JwtModule,
    PrismaModule,
    PassportModule,
    SecurityModule,
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    TokenService,
    AccessTokenStrategy,
    SessionService,
  ],

  exports: [
    TokenService,
  ],
})
export class AuthModule {}