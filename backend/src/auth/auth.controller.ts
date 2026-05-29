import { Body, Controller, Post, Res, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest, RefreshRequestUser } from './types/authenticated-request.type';
import { setAuthCookies, clearAuthCookies } from './utils/auth-cookies';
import { AccessTokenPayload } from './types/access-token-payload.type';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    setAuthCookies(res, tokens);
    return { success: true };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Req() req: AuthenticatedRequest<RefreshRequestUser>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refresh(req.user);
    setAuthCookies(res, tokens);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: AccessTokenPayload,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.cookies?.refreshToken
      ? this.authService.extractSessionId(req.cookies.refreshToken)
      : null;

    if (sessionId) {
      await this.authService.logout(sessionId);
    }

    clearAuthCookies(res);
    return { success: true };
  }
}