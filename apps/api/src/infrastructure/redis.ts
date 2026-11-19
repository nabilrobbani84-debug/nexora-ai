import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: 2,
  retryStrategy(times) {
    return Math.min(times * 100, 2_000);
  },
});

redis.on('error', (error) => {
  logger.warn({ err: error }, 'Redis connection error');
});

export async function ensureRedisConnection(): Promise<void> {
  if (redis.status === 'wait') {
    await redis.connect();
  }
}
