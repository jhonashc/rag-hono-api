import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
});

export type Env = z.infer<typeof envSchema>;
