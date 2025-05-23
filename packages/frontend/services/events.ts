import { useState } from 'react';
import { Event } from '../../backend/src/models/interfaces';
import { schedulePushNotification } from './notifications';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Bake Cookies',
      eventTime: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      userId: 'user1'
    }
  ]);

  const createEvent = async (event: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
    
    setEvents(prev => [...prev, newEvent]);

    // Schedule notification
    const reminderTime = new Date(newEvent.eventTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 15);
    
    await schedulePushNotification(
      `Reminder: ${newEvent.title}`,
      `Starts at ${new Date(newEvent.eventTime).toLocaleString()}`,
      reminderTime
    );

    return newEvent;
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    
    // Reschedule notification if time changed
    if (updates.eventTime) {
      const event = events.find(e => e.id === id);
      if (event) {
        const reminderTime = new Date(updates.eventTime);
        reminderTime.setMinutes(reminderTime.getMinutes() - 15);
        
        await schedulePushNotification(
          `Reminder: ${event.title}`,
          `Starts at ${new Date(updates.eventTime).toLocaleString()}`,
          reminderTime
        );
      }
    }
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    // Note: we can do more by cancelling scheduled notification here
  };

  return { events, createEvent, updateEvent, deleteEvent };
};