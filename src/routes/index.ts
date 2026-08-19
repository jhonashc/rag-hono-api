import { Hono } from 'hono';

import filesRouter from '@/routes/files';

const routes = new Hono();

routes.route('/files', filesRouter);

export default routes;
