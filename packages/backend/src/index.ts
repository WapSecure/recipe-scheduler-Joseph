import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http'; // Add this import
import { errorHandler } from './middlewares/errorHandler';
import { router } from './routes';
import { initializeDatabase } from './config/database';
import { QueueService } from './services/queue.service';
import { EventService } from './services/event.service';
import { DeviceService } from './services/device.service';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';

export const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const server = http.createServer(app); // Create HTTP server

// Service Container
export type Services = {
  eventService: EventService;
  deviceService: DeviceService;
  queueService: QueueService;
};

const initializeServices = async (): Promise<Services> => {
  await initializeDatabase();
  const queueService = new QueueService();
  const deviceService = new DeviceService();
  const eventService = new EventService(queueService, deviceService);
  return { eventService, deviceService, queueService };
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const startServer = async (port: number): Promise<http.Server> => {
  const services = await initializeServices();
  
  app.use((req, res, next) => {
    req.services = services;
    next();
  });

  app.use('/api', router);
  app.use(errorHandler);

  return new Promise((resolve, reject) => {
    const s = server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/api/health`);
      resolve(s);
    }).on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying ${port + 1}...`);
        startServer(port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

startServer(PORT)
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// Type extensions
declare global {
  namespace Express {
    interface Request {
      services?: Services;
    }
  }
}