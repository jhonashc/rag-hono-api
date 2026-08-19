import { Hono } from 'hono';
import { logger } from 'hono/logger';

import { env } from '@/config/env';

const app = new Hono();

app.use(logger());

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

export default {
  port: env.PORT,
  fetch: app.fetch,
};
