import { z } from 'zod';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID');

export const reviewCreateSchema = z.object({
  menuItemId: objectId,
  rating: z.coerce.number().int().min(1).max(5),
  subject: z.string().trim().max(120).optional(),
  comment: z.string().trim().max(2000).optional(),
  images: z.array(z.string().trim()).max(4).optional(),
}).strict();

export const reviewMenuParamSchema = z.object({ menuItemId: objectId });