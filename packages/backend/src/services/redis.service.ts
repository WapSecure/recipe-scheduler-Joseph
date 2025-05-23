import { Redis } from 'ioredis';
import { getConfig } from '../config';

const config = getConfig();

export const redisConnection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

// I Optionally added connection events for better debugging
redisConnection.on('connect', () => {
  if (config.nodeEnv !== 'test') {
    console.log('Connected to Redis');
  }
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});