import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import routes from '@/routes';

const app = new Hono();

app.use(cors());
app.use(logger());

app.route('/api/v1', routes);

export default app;
