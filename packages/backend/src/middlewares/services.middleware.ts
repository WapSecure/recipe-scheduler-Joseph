import { Request, Response, NextFunction } from 'express';
import { QueueService } from '../services/queue.service';
import { DeviceService } from '../services/device.service';
import { EventService } from '../services/event.service';
import { initializeDatabase } from '../config/database';

let servicesInitialized = false;
let services: {
  eventService: EventService;
  deviceService: DeviceService;
  queueService: QueueService;
};

export const injectServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!servicesInitialized) {
      await initializeDatabase();
      const queueService = new QueueService();
      const deviceService = new DeviceService();
      const eventService = new EventService(queueService, deviceService);
      
      services = {
        eventService,
        deviceService,
        queueService
      };
      servicesInitialized = true;
    }

    req.services = services;
    next();
  } catch (error) {
    next(error);
  }
};