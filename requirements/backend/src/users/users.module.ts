import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../common/security/security.module';

@Module({
  imports: [PrismaModule, SecurityModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}