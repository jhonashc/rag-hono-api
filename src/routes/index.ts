import { Hono } from 'hono';

import conversationsRouter from '@/routes/conversations.route';

const routes = new Hono();

routes.route('/conversations', conversationsRouter);

export default routes;
