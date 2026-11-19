import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginInputSchema } from '@nexora/shared';
import { asyncHandler } from '../../lib/async-handler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate.js';
import { authController } from './auth.controller.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    type: 'https://nexora.local/problems/rate-limited',
    title: 'Too Many Requests',
    status: 429,
    detail: 'Too many authentication attempts. Try again later.',
    code: 'RATE_LIMITED',
  },
});

export const authRouter = Router();

authRouter.get('/csrf', authController.csrf);
authRouter.post(
  '/login',
  authLimiter,
  validateBody(loginInputSchema),
  asyncHandler(authController.login),
);
authRouter.post('/refresh', authLimiter, asyncHandler(authController.refresh));
authRouter.post('/logout', authenticate, asyncHandler(authController.logout));
authRouter.get('/me', authenticate, asyncHandler(authController.me));
