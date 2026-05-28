import { Body, Controller, Post, Res, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthenticatedRequest } from './types/authenticated-request.type';
import { RefreshRequestUser } from './types/authenticated-request.type';
import { setAuthCookies } from  './utils/auth-cookies'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    const isProd = process.env.NODE_ENV === 'production';

    setAuthCookies(res, result);

    return { success: true };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Req() req: AuthenticatedRequest<RefreshRequestUser>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refresh(req.user);

    setAuthCookies(res, result);

    return { success: true };
  }
}