import { Worker } from 'bullmq';
import { notificationWorker } from './consumers/notification.consumer';
import { redisConnection } from './services/redis.service';
import { getConfig } from './config';

const config = getConfig();

const worker = new Worker(
  'event-reminders',
  notificationWorker,
  {
    connection: redisConnection,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 }
  }
);

console.log(`Worker started. Listening for reminders with ${config.reminderLeadMinutes} min lead time...`);

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});