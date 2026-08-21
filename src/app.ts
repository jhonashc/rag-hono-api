import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';

import { ZodError } from 'zod';

import routes from '@/routes';

const app = new Hono();

app.use(logger());

app.route('/api/v1', routes);

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ status: false, message: error.message }, error.status);
  }

  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => {
      const [, ...rest] = issue.path;
      const field = rest.length > 0 ? rest.join('.') : issue.path.join('.');

      return {
        field,
        message: issue.message,
      };
    });

    return c.json({ status: false, message: 'Validation failed', errors }, 400);
  }

  return c.json({ status: false, message: 'Something went wrong, try again later' }, 500);
});

export default app;
