import { useState, useEffect } from 'react';
import { 
  getEvents as getEventsApi,
  createEvent as createEventApi,
  updateEvent as updateEventApi,
  deleteEvent as deleteEventApi 
} from './api';
import { schedulePushNotification } from './notifications';
import { Event as RecipeEvent } from '../../backend/src/models/interfaces';

const TEST_USER_ID = 'test-user';

export const useEvents = () => {
  const [events, setEvents] = useState<RecipeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const events = await getEventsApi(TEST_USER_ID);
      setEvents(events);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load events'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Events updated:', events);
  }, [events]);

  useEffect(() => {
    loadEvents();
  }, []);

  const createEvent = async (event: Omit<RecipeEvent, 'id' | 'createdAt'>) => {
    const tempId = Date.now().toString(); // Temporary ID for optimistic update
    
    try {
      const optimisticEvent = {
        ...event,
        id: tempId,
        createdAt: new Date().toISOString(),
        userId: TEST_USER_ID
      };
      
      setEvents(prev => [...prev, optimisticEvent]);
      
      const newEvent = await createEventApi({ ...event, userId: TEST_USER_ID });
      
      setEvents(prev => prev.map(e => e.id === tempId ? newEvent : e));
      
      await scheduleReminder(newEvent);
      return newEvent;
    } catch (err) {
      setEvents(prev => prev.filter(e => e.id !== tempId));
      throw err instanceof Error ? err : new Error('Failed to create event');
    }
  };

  const updateEvent = async (id: string, updates: Partial<RecipeEvent>) => {
    try {
      const updatedEvent = await updateEventApi(id, updates);
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
      await scheduleReminder(updatedEvent);
      return updatedEvent;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update event');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteEventApi(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete event');
    }
  };

  const scheduleReminder = async (event: RecipeEvent) => {
    const reminderTime = new Date(event.eventTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 15);
    
    try {
      await schedulePushNotification(
        `Reminder: ${event.title}`,
        `Starts at ${new Date(event.eventTime).toLocaleString()}`,
        reminderTime,
        event.id
      );
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  };

  const refetch = () => {
    loadEvents();
  };

  return { 
    events, 
    loading, 
    error,
    createEvent, 
    updateEvent, 
    deleteEvent,
    refetch
  };
};