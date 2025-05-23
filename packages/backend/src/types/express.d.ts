import { EventService } from '../services/event.service';
import { DeviceService } from '../services/device.service';
import { QueueService } from '../services/queue.service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
      services?: {
        eventService: EventService;
        deviceService: DeviceService;
        queueService: QueueService;
      };
    }
  }
}