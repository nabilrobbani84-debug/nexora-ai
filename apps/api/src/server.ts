import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './infrastructure/logger.js';
import { prisma } from './infrastructure/prisma.js';
import { redis } from './infrastructure/redis.js';
import { createSocketServer } from './realtime/socket-server.js';

const app = createApp();
const httpServer = createServer(app);
const io = createSocketServer(httpServer);

httpServer.listen(env.API_PORT, () => {
  logger.info({ port: env.API_PORT }, 'NEXORA API listening');
});

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown started');

  await new Promise<void>((resolve) => io.close(() => resolve()));
  await new Promise<void>((resolve, reject) => {
    httpServer.close((error) => (error ? reject(error) : resolve()));
  });
  await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
  logger.info('Graceful shutdown complete');
}

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    void shutdown(signal)
      .then(() => process.exit(0))
      .catch((error: unknown) => {
        logger.error({ err: error }, 'Graceful shutdown failed');
        process.exit(1);
      });
  });
}
