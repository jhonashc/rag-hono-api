import { envSchema, type Env } from '@/schemas/env.schema';

const envServer = envSchema.safeParse(process.env);

if (!envServer.success) {
  console.error(envServer.error.issues);
  process.exit(1);
}

export const env: Env = envServer.data as Env;
