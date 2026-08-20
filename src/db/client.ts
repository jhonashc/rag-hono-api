import { SQL } from 'bun';

import { env } from '@/config/env';

const THIRTY_MINUTES_IN_SECONDS = 60 * 30;

export const sql = new SQL(env.DATABASE_URL, {
  max: 20,
  idleTimeout: 30,
  connectionTimeout: 10,
  maxLifetime: THIRTY_MINUTES_IN_SECONDS,
  prepare: true,
});
