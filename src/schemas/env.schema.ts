import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;
