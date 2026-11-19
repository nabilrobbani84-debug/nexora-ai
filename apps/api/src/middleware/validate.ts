import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { errors } from '../lib/app-error.js';

export const validateBody = (schema: ZodType): RequestHandler => (request, _response, next) => {
  const result = schema.safeParse(request.body);

  if (!result.success) {
    const details: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join('.') || 'body';
      details[field] = [...(details[field] ?? []), issue.message];
    }
    next(errors.badRequest('VALIDATION_FAILED', 'Request validation failed.', details));
    return;
  }

  request.body = result.data;
  next();
};
