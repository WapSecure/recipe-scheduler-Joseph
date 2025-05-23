import { Redis } from 'ioredis';
import { getConfig } from '../config';

const config = getConfig();

export const redisConnection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export const getRedisConnection = () => redisConnection;