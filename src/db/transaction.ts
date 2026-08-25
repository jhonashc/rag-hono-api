import { SQL } from 'bun';

import { sql as pg } from '@/db/client';

export class TransactionManager {
  constructor(private readonly sql: SQL = pg) {}

  async run<T>(fn: (tx: SQL) => Promise<T>): Promise<T> {
    return this.sql.begin((tx) => fn(tx));
  }
}
