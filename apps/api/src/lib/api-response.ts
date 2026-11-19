import type { Response } from 'express';
import type { ApiSuccess } from '@nexora/shared';

export function sendData<T>(response: Response, data: T, status = 200): Response<ApiSuccess<T>> {
  return response.status(status).json({ data });
}
