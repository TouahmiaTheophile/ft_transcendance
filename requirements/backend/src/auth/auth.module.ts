import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { AuthController }
  from './auth.controller';

import { AuthService }
  from './auth.service';

import { PasswordService }
  from './password.service';

import { JwtService }
  from './jwt.service';

import { AccessTokenStrategy }
  from './strategies/access-token.strategy';

import { SessionService } from './session.service';


import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    JwtModule,
    PrismaModule,
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    JwtService,
    PasswordService,
    AccessTokenStrategy,
    SessionService,
  ],

  exports: [
    PasswordService,
    JwtService,
  ],
})
export class AuthModule {}