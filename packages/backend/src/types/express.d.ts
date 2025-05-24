import { EventService } from '../services/event.service';
import { DeviceService } from '../services/device.service';
import { QueueService } from '../services/queue.service';

export interface AppServices {
  eventService: EventService;
  deviceService: DeviceService;
  queueService: QueueService;
}

declare module 'express-serve-static-core' {
  interface Request {
    services?: AppServices;
  }
}