import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { OpenAPIHono } from '@hono/zod-openapi';

import { Scalar } from '@scalar/hono-api-reference';

import routes from '@/routes';

import packageJSON from '../package.json';

const app = new OpenAPIHono({ strict: false });

app.use(cors());
app.use(logger());

app.route('/api/v1', routes);

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: packageJSON.version,
    title: 'Rag Hono API',
  },
});

app.get(
  '/reference',
  Scalar({
    url: '/doc',
    theme: 'deepSpace',
    layout: 'classic',
    defaultHttpClient: {
      targetKey: 'js',
      clientKey: 'fetch',
    },
  }),
);

export default app;
