import { Hono } from 'hono';

const filesRouter = new Hono();

filesRouter.post('/upload/single', (c) => {
  return c.json({ path: c.req.path });
});

export default filesRouter;
