import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { env } from './config/env.js';
import { logger } from './infrastructure/logger.js';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const worker = new Worker(
  'foundation',
  async (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, 'Foundation job processed');
    return { processedAt: new Date().toISOString() };
  },
  { connection, concurrency: 2 },
);

worker.on('failed', (job, error) => {
  logger.error({ err: error, jobId: job?.id }, 'Background job failed');
});

async function shutdown(): Promise<void> {
  await worker.close();
  await connection.quit();
}

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    void shutdown().finally(() => process.exit(0));
  });
}
