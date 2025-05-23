import { Event, Device } from '../models/interfaces';

export interface IEventService {
    createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event>;
    getEventsByUser(userId: string): Promise<Event[]>;
    updateEvent(id: string, updates: Partial<Pick<Event, 'title' | 'eventTime'>>): Promise<Event | null>;
    deleteEvent(id: string): Promise<boolean>;
  }
  
  export interface IDeviceService {
    saveDeviceToken(userId: string, pushToken: string): Promise<Device>;
    getDeviceToken(userId: string): Promise<string | null>;
  }
  
  export interface IQueueService {
    scheduleReminder(event: Event, pushToken: string): Promise<void>;
  }