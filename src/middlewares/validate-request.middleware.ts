import { createMiddleware } from 'hono/factory';

import { z } from 'zod';

export const validateRequest = <T extends z.ZodSchema>(schema: T) =>
  createMiddleware<{
    Variables: { validated: z.infer<T> };
  }>(async (c, next) => {
    const body = await c.req.json().catch(() => ({}));

    const parsed = schema.parse({
      json: body,
      param: c.req.param(),
      query: c.req.query(),
    });

    c.set('validated', parsed);
    await next();
  });
