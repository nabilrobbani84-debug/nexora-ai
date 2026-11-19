import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

export const cookieNames = {
  access: 'nexora_access',
  refresh: 'nexora_refresh',
  csrf: 'nexora_csrf',
} as const;

const baseCookieOptions: CookieOptions = {
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

export function setAuthCookies(response: Response, accessToken: string, refreshToken: string): void {
  response.cookie(cookieNames.access, accessToken, {
    ...baseCookieOptions,
    httpOnly: true,
    path: '/',
    maxAge: env.ACCESS_TOKEN_TTL_MINUTES * 60 * 1_000,
  });
  response.cookie(cookieNames.refresh, refreshToken, {
    ...baseCookieOptions,
    httpOnly: true,
    path: '/api/v1/auth',
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1_000,
  });
}

export function setCsrfCookie(response: Response, token: string): void {
  response.cookie(cookieNames.csrf, token, {
    ...baseCookieOptions,
    httpOnly: false,
    sameSite: 'strict',
    path: '/',
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1_000,
  });
}

export function clearAuthCookies(response: Response): void {
  response.clearCookie(cookieNames.access, { ...baseCookieOptions, httpOnly: true, path: '/' });
  response.clearCookie(cookieNames.refresh, {
    ...baseCookieOptions,
    httpOnly: true,
    path: '/api/v1/auth',
  });
}
