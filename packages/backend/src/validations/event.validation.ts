import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  eventTime: z.string()
    .datetime({ offset: true })
    .refine((val) => new Date(val) > new Date(), {
      message: 'Event time must be in the future',
    }),
  userId: z.string().default('default-user'),
});

export const eventIdSchema = z.object({
  id: z.string().uuid('Invalid event ID format'),
});

export type CreateEventInput = z.infer<typeof eventSchema>;
