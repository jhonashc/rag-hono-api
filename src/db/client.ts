import { SQL } from 'bun';

import { env } from '@/config/env';

export const sql = new SQL(env.DATABASE_URL);
