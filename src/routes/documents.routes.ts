import { Hono } from 'hono';

const documentsRouter = new Hono();

documentsRouter.post('/upload/single', (c) => {
  return c.json({ path: c.req.path });
});

export default documentsRouter;
