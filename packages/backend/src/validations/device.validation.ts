import { z } from 'zod';

export const deviceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  pushToken: z.string().min(1, 'Push token is required'),
});