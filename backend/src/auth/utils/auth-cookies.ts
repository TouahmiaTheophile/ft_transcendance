import { Response } from 'express';
import { AuthTokens } from '@shared/auth/auth-tokens.type';

const IS_PROD = process.env.NODE_ENV === 'production';

export function setAuthCookies(res: Response, tokens: AuthTokens) {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/auth/refresh',
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken', {
    path: '/',
    sameSite: 'lax',
  });

  res.clearCookie('refreshToken', {
    path: '/auth/refresh',
    sameSite: 'lax',
  });
}