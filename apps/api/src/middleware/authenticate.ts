import type { RequestHandler } from 'express';
import { authRepository } from '../modules/auth/auth.repository.js';
import { errors } from '../lib/app-error.js';
import { cookieNames } from '../security/cookies.js';
import { verifyAccessToken } from '../security/token.js';

export const authenticate: RequestHandler = async (request, _response, next) => {
  try {
    const token = request.cookies[cookieNames.access] as string | undefined;
    if (!token) throw errors.unauthorized();

    const claims = await verifyAccessToken(token);
    const session = await authRepository.findActiveSession(
      claims.sessionId,
      claims.sub,
      claims.organizationId,
    );
    if (!session) throw errors.unauthorized('SESSION_INVALID', 'The session is no longer active.');

    request.principal = {
      userId: claims.sub,
      organizationId: claims.organizationId,
      sessionId: claims.sessionId,
      roles: claims.roles,
      permissions: claims.permissions,
    };
    next();
  } catch (error) {
    next(error);
  }
};
