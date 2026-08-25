import { OpenAPIHono } from '@hono/zod-openapi';

import conversationsRouter from '@/routes/conversations.route';

const routes = new OpenAPIHono();

routes.route('/conversations', conversationsRouter);

export default routes;
