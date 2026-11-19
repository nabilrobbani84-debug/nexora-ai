import type { Request, Response } from 'express';
import { prisma } from '../../infrastructure/prisma.js';
import { ensureRedisConnection, redis } from '../../infrastructure/redis.js';

const version = process.env.npm_package_version ?? '0.1.0';

export const healthController = {
  live(_request: Request, response: Response) {
    return response.json({
      status: 'ok',
      version,
      timestamp: new Date().toISOString(),
    });
  },

  async ready(_request: Request, response: Response) {
    const dependencies = { database: 'down' as 'up' | 'down', redis: 'down' as 'up' | 'down' };

    await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`.then(() => {
        dependencies.database = 'up';
      }),
      ensureRedisConnection()
        .then(() => redis.ping())
        .then(() => {
          dependencies.redis = 'up';
        }),
    ]);

    const status = dependencies.database === 'up' && dependencies.redis === 'up' ? 'ok' : 'degraded';
    return response.status(status === 'ok' ? 200 : 503).json({
      status,
      version,
      timestamp: new Date().toISOString(),
      dependencies,
    });
  },
};
