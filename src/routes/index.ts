import { Hono } from 'hono';

import filesRouter from '@/routes/files.routes';

const routes = new Hono();

routes.route('/files', filesRouter);

export default routes;
