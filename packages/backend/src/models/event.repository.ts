import { Event } from './interfaces';

export abstract class EventRepository {
  abstract createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event>;
  abstract getEventsByUser(userId: string): Promise<Event[]>;
  abstract updateEvent(id: string, updates: Partial<Pick<Event, 'title' | 'eventTime'>>): Promise<Event | null>;
  abstract deleteEvent(id: string): Promise<boolean>;
  abstract getEventById(id: string): Promise<Event | null>;
}