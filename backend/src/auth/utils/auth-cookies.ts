import { Response } from 'express';
import { AuthTokens } from '@shared/auth/auth-tokens.type';

export function setAuthCookies(
  res: Response,
  tokens: AuthTokens,
) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/auth/refresh',
  });
}