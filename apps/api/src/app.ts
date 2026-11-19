import { randomUUID } from 'node:crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './infrastructure/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { requestContext } from './middleware/request-context.js';
import { verifyCsrf } from './security/csrf.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { foundationRouter } from './modules/foundation/foundation.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { openApiDocument } from './openapi/document.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY ? 1 : false);

  app.use(requestContext);
  app.use(
    pinoHttp({
      logger,
      genReqId: (request) => request.id ?? randomUUID(),
      customProps: (request) => ({ requestId: request.id }),
    }),
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        callback(null, !origin || origin === env.WEB_ORIGIN);
      },
      allowedHeaders: ['content-type', 'x-csrf-token'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );
  app.use(verifyCsrf);

  app.get('/api/v1/openapi.json', (_request, response) => response.json(openApiDocument));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { explorer: false }));
  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/foundation', foundationRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
