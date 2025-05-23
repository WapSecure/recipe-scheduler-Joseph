import { QueueService } from './queue.service';
import { DeviceService } from './device.service';
import { EventService } from './event.service';

let eventService: EventService;

export const initializeServices = () => {
  const queueService = new QueueService();
  const deviceService = new DeviceService();
  eventService = new EventService(queueService, deviceService);
};

export const getEventService = () => {
  if (!eventService) throw new Error('Services not initialized');
  return eventService;
};