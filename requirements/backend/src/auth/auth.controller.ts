import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { RefreshTokenGuard } from './guards/refresh-token.guard';

import { AuthenticatedRequest }
  from './types/authenticated-request.type';

import { RefreshRequestUser }
  from './types/authenticated-request.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(@Req() req: AuthenticatedRequest<RefreshRequestUser>) {
    return this.authService.refresh(req.user);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('testAccessToken')
  // test(@Req() req: AuthenticatedRequest) {
  //   return {
  //     success: true,
  //     userId: req.user.sub,
  //   };
  // }
}