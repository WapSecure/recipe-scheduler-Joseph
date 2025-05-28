import { Request, Response } from 'express';
import { deviceSchema } from '../validations/device.validation';
import { ZodError } from 'zod';

function getErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.errors.map(e => e.message).join(', ');
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Device token management
 */

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Register a device push token
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Device'
 *     responses:
 *       201:
 *         description: The registered device
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       400:
 *         description: Validation error
 */

export const saveDeviceToken = async (req: Request, res: Response) => {
    try {
      if (!req.services) throw new Error('Services not initialized');
      
      const { deviceService } = req.services;
      const { userId, pushToken } = deviceSchema.parse(req.body);
      
      const device = await deviceService.saveDeviceToken(userId, pushToken);
      res.status(201).json(device);
    } catch (error) {
      res.status(400).json({ 
        error: getErrorMessage(error),
        ...(error instanceof ZodError ? { details: error.errors } : {})
      });
    }
};