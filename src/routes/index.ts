import { Hono } from 'hono';

import documentsRouter from '@/routes/documents.routes';

const routes = new Hono();

routes.route('/documents', documentsRouter);

export default routes;
