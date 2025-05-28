import { Request, Response } from 'express';
import { eventSchema, eventIdSchema } from '../validations/event.validation';
import { isZodError, getErrorMessage } from '../utils/errorUtils';
import { AppServices } from '../types';

interface CustomRequest extends Request {
  services?: AppServices;
}

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Cooking event management
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new cooking event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: The created event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 */

export const createEvent = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.services) throw new Error('Services not available');
    const { eventService } = req.services;

    const validatedData = eventSchema.parse({
      ...req.body,
      userId: req.body.userId || 'default-user',
    });

    const eventDate = new Date(validatedData.eventTime);
    if (eventDate <= new Date()) {
      return res.status(400).json({ 
        error: 'Event time must be in the future' 
      });
    }

    const event = await eventService.createEvent(validatedData);
    res.status(201).json(event);
  } catch (error) {
    if (isZodError(error)) {
      const errorMessage = error.errors.map(e => e.message).join(', ');
      return res.status(400).json({ 
        error: errorMessage.includes('must be in the future') 
          ? 'Event time must be in the future'
          : errorMessage
      });
    }
    res.status(400).json({ 
      error: error instanceof Error 
        ? error.message.includes('must be in the future')
          ? 'Event time must be in the future'
          : error.message
        : 'Failed to create event'
    });
  }
};

/**
 * @swagger
 * /events:
 *   get:
 *     summary: List upcoming events for a user
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of upcoming events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */

export const getEvents = async (req: Request, res: Response) => {
  try {
    if (!req.services) throw new Error('Services not available');
    const { eventService } = req.services;

    const userId = typeof req.query.userId === 'string' 
      ? req.query.userId 
      : 'default-user';
    
    // Pagination parameters with defaults
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const events = await eventService.getEventsByUser(userId, limit, offset);
    
    res.json({
      data: events,
      pagination: {
        limit,
        offset,
        total: events.length,
        hasMore: events.length === limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     summary: Update an existing cooking event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated event title
 *                 example: "Bake sourdough bread"
 *               eventTime:
 *                 type: string
 *                 format: date-time
 *                 description: Updated event time
 *                 example: "2023-12-25T19:00:00Z"
 *     responses:
 *       200:
 *         description: The updated event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Event not found
 */

export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!req.services) throw new Error('Services not available');
    const { eventService } = req.services;

    const { id } = eventIdSchema.parse(req.params);
    const updates = eventSchema.partial().parse(req.body);
    
    if (updates.eventTime) {
      const eventDate = new Date(updates.eventTime);
      if (eventDate <= new Date()) {
        return res.status(400).json({ 
          error: 'Event time must be in the future' 
        });
      }
    }
    
    const updatedEvent = await eventService.updateEvent(id, updates);
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(updatedEvent);
  } catch (error) {
    if (isZodError(error)) {
      const errorMessage = error.errors.map(e => e.message).join(', ');
      return res.status(400).json({ 
        error: errorMessage.includes('must be in the future') 
          ? 'Event time must be in the future'
          : errorMessage
      });
    }
    res.status(400).json({ 
      error: error instanceof Error 
        ? error.message.includes('must be in the future')
          ? 'Event time must be in the future'
          : error.message
        : 'Failed to update event'
    });
  }
};

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete a cooking event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The event ID
 *     responses:
 *       204:
 *         description: Event was successfully deleted
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Event not found
 */

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    if (!req.services) throw new Error('Services not available');
    const { eventService } = req.services;

    const { id } = eventIdSchema.parse(req.params);
    const success = await eventService.deleteEvent(id);
    if (!success) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: getErrorMessage(error) });
  }
};