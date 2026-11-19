import type { RequestHandler } from 'express';
import type { Permission } from '@nexora/shared';
import { errors } from '../lib/app-error.js';

export const requirePermission = (permission: Permission): RequestHandler =>
  (request, _response, next) => {
    if (!request.principal) {
      next(errors.unauthorized());
      return;
    }
    if (!request.principal.permissions.includes(permission)) {
      next(errors.forbidden('PERMISSION_DENIED', `Permission '${permission}' is required.`));
      return;
    }
    next();
  };
