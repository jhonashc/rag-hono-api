import { Hono } from 'hono';
import { logger } from 'hono/logger';

import { env } from '@/config/env';
import routes from '@/routes';

const app = new Hono();

app.use(logger());

app.route('/api/v1', routes);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
