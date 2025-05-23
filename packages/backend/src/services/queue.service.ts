import { Queue } from 'bullmq';
import { Event } from '../models/interfaces';
import { redisConnection } from './redis.service';
import { getConfig } from '../config';

const config = getConfig();

export class QueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('event-reminders', {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      }
    });
  }

  async scheduleReminder(event: Event): Promise<void> {
    const reminderTime = new Date(event.eventTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - config.reminderLeadMinutes);

    await this.queue.add(
      `reminder:${event.id}`,
      { event },
      { 
        delay: Math.max(0, reminderTime.getTime() - Date.now()),
        jobId: `reminder:${event.id}`
      }
    );

    if (config.nodeEnv !== 'test') {
      console.log(`Scheduled reminder for event ${event.id} at ${reminderTime.toISOString()}`);
    }
  }
}