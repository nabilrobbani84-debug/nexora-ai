import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../lib/app-error.js';
import { logger } from '../infrastructure/logger.js';

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    type: 'https://nexora.local/problems/not-found',
    title: 'Not Found',
    status: 404,
    detail: 'The requested API endpoint does not exist.',
    code: 'ROUTE_NOT_FOUND',
    requestId: request.id,
  });
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.status).json({
      type: `https://nexora.local/problems/${error.code.toLowerCase().replaceAll('_', '-')}`,
      title: error.status >= 500 ? 'Internal Server Error' : error.message,
      status: error.status,
      detail: error.message,
      code: error.code,
      requestId: request.id,
      ...(error.details ? { errors: error.details } : {}),
    });
    return;
  }

  logger.error({ err: error, requestId: request.id }, 'Unhandled request error');
  response.status(500).json({
    type: 'https://nexora.local/problems/internal-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred.',
    code: 'INTERNAL_ERROR',
    requestId: request.id,
  });
};
