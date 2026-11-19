import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { errors } from '../lib/app-error.js';
import { cookieNames } from './cookies.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export const createCsrfToken = (): string => randomBytes(32).toString('base64url');

export function csrfTokensMatch(cookieToken: unknown, headerToken: unknown): boolean {
  if (typeof cookieToken !== 'string' || typeof headerToken !== 'string') return false;
  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);
  return cookieBuffer.length === headerBuffer.length && timingSafeEqual(cookieBuffer, headerBuffer);
}

export const verifyCsrf: RequestHandler = (request, _response, next) => {
  if (safeMethods.has(request.method)) {
    next();
    return;
  }

  const origin = request.get('origin');
  if (origin && origin !== env.WEB_ORIGIN) {
    next(errors.forbidden('CSRF_ORIGIN_REJECTED', 'The request origin is not trusted.'));
    return;
  }

  if (!csrfTokensMatch(request.cookies[cookieNames.csrf], request.get('x-csrf-token'))) {
    next(errors.forbidden('CSRF_TOKEN_INVALID', 'A valid CSRF token is required.'));
    return;
  }

  next();
};
