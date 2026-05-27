import { ConnectionOptions } from 'bullmq';
import { logger } from './logger';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const getRedisConnectionOptions = (): ConnectionOptions => {
  try {
    // If it's a URL, let Redis parser handle it, or we can pass url configuration
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      username: url.username || undefined,
      password: url.password || undefined,
      maxRetriesPerRequest: null, // BullMQ requires maxRetriesPerRequest to be null
    };
  } catch (err) {
    logger.warn('Failed to parse REDIS_URL, falling back to local defaults', { error: err });
    return {
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null,
    };
  }
};

export const createRedisClient = () => {
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  });

  client.on('connect', () => {
    logger.info('Connected to Redis server.');
  });

  client.on('error', (err) => {
    logger.error('Redis Client Error', err);
  });

  return client;
};
