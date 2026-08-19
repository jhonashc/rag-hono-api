import { envSchema, type Env } from '@/schemas/env.schema';
import { validator } from '@/validation';

const envServer = validator.validate<Env>(envSchema, process.env);

if (!envServer.success) {
  console.error(envServer.errors);
  process.exit(1);
}

export const env: Env = envServer.data as Env;
