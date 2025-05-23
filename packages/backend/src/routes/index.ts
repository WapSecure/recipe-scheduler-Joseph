// src/routes/index.ts
import { Router } from 'express';
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller';
import { saveDeviceToken } from '../controllers/device.controller';
import { validateRequest } from '../middlewares/validation';
import { eventSchema } from '../validations/event.validation';
import { deviceSchema } from '../validations/device.validation';

const router = Router();

// Event routes
router.post('/events', validateRequest(eventSchema), createEvent);
router.get('/events', getEvents);
router.patch('/events/:id', validateRequest(eventSchema.partial()), updateEvent);
router.delete('/events/:id', deleteEvent);

// Device routes
router.post('/devices', validateRequest(deviceSchema), saveDeviceToken);

// Health check

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health status
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 */
router.get('/health', (req, res) => res.json({ status: 'healthy' }));

export { router };