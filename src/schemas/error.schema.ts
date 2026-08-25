import { z } from '@hono/zod-openapi';

export const errorResponseSchema = z
  .object({
    status: z.literal(false),
    message: z.string(),
  })
  .openapi('Error');
