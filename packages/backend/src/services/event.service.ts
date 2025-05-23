import { getEventRepository, getDeviceRepository } from '../config/database';
import { IEventService, IQueueService, IDeviceService } from '.';
import { Event } from '../models/interfaces';

export class EventService implements IEventService {
    constructor(
      private queueService: IQueueService,
      private deviceService: IDeviceService
    ) {}
  
    async createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
      if (!event.userId) {
        throw new Error('userId is required to create an event');
      }

      const repo = getEventRepository();
      const newEvent = await repo.createEvent(event);
      
      // injected deviceService
      const pushToken = await this.deviceService.getDeviceToken(event.userId);
      if (pushToken) {
        await this.queueService.scheduleReminder(newEvent, pushToken);
      }
      
      return newEvent;
    }
  
    async getEventsByUser(userId: string): Promise<Event[]> {
      return getEventRepository().getEventsByUser(userId);
    }
  
    async updateEvent(
      id: string, 
      updates: Partial<Pick<Event, 'title' | 'eventTime'>>
    ): Promise<Event | null> {
      const repo = getEventRepository();
      const event = await repo.updateEvent(id, updates);
      
      if (event) {
        if (!event.userId) {
          console.warn('Cannot schedule reminder for event without userId');
          return event;
        }

        const pushToken = await getDeviceRepository().getDeviceToken(event.userId);
        if (pushToken) {
          await this.queueService.scheduleReminder(event, pushToken);
        }
      }
      
      return event;
    }
  
    async deleteEvent(id: string): Promise<boolean> {
      return getEventRepository().deleteEvent(id);
    }
}