export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errors = {
  badRequest: (code: string, message: string, details?: Record<string, string[]>) =>
    new AppError(400, code, message, details),
  unauthorized: (code = 'AUTH_REQUIRED', message = 'Authentication is required.') =>
    new AppError(401, code, message),
  forbidden: (code = 'FORBIDDEN', message = 'You do not have permission for this action.') =>
    new AppError(403, code, message),
  notFound: (code = 'NOT_FOUND', message = 'The requested resource was not found.') =>
    new AppError(404, code, message),
  conflict: (code: string, message: string) => new AppError(409, code, message),
  tooManyRequests: (message = 'Too many requests. Try again later.') =>
    new AppError(429, 'RATE_LIMITED', message),
};
