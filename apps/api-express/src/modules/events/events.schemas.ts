import { z } from 'zod';

export const eventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED']);

const titleSchema = z.string().trim().min(1).max(200);
const descriptionSchema = z.string().trim().max(5000);

export const createEventSchema = z.strictObject({
  title: titleSchema,
  description: descriptionSchema.default(''),
});

export const updateEventSchema = z.strictObject({
  title: titleSchema.optional(),
  description: descriptionSchema.optional(),
  status: eventStatusSchema.optional(),
});

export type EventStatus = z.infer<typeof eventStatusSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
