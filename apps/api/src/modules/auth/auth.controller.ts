import type { Request, Response } from 'express';
import type { LoginInput } from '@nexora/shared';
import { sendData } from '../../lib/api-response.js';
import { errors } from '../../lib/app-error.js';
import { clearAuthCookies, cookieNames, setAuthCookies, setCsrfCookie } from '../../security/cookies.js';
import { createCsrfToken } from '../../security/csrf.js';
import { authService } from './auth.service.js';

const metadataFrom = (request: Request) => ({
  requestId: request.id,
  ...(request.get('user-agent') ? { userAgent: request.get('user-agent') } : {}),
  ...(request.ip ? { ipAddress: request.ip } : {}),
});

export const authController = {
  csrf(_request: Request, response: Response) {
    const csrfToken = createCsrfToken();
    setCsrfCookie(response, csrfToken);
    return sendData(response, { csrfToken });
  },

  async login(request: Request, response: Response) {
    const result = await authService.login(request.body as LoginInput, metadataFrom(request));
    setAuthCookies(response, result.accessToken, result.refreshToken);
    return sendData(response, result.response);
  },

  async refresh(request: Request, response: Response) {
    const refreshToken = request.cookies[cookieNames.refresh] as string | undefined;
    const result = await authService.refresh(refreshToken, metadataFrom(request));
    setAuthCookies(response, result.accessToken, result.refreshToken);
    return sendData(response, result.response);
  },

  async logout(request: Request, response: Response) {
    if (!request.principal) throw errors.unauthorized();
    clearAuthCookies(response);
    await authService.logout(request.principal.sessionId, request.id);
    return response.status(204).send();
  },

  async me(request: Request, response: Response) {
    if (!request.principal) throw errors.unauthorized();
    const user = await authService.currentUser(
      request.principal.userId,
      request.principal.organizationId,
    );
    return sendData(response, { user });
  },
};
