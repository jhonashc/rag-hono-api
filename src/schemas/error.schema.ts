import { z } from '@hono/zod-openapi';

const zodIssueSchema = z.object({
  code: z.string(),
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
  expected: z.string().optional(),
  received: z.string().optional(),
});

const errorDetailsSchema = z.object({
  name: z.string().openapi({ example: 'ZodError' }),
  message: z.string().openapi({
    example:
      '[{"expected":"string","code":"invalid_type","path":["title"],"message":"Invalid input: expected string, received undefined"}]',
  }),
  issues: z.array(zodIssueSchema).optional(),
});

export const errorResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: false }),
    error: errorDetailsSchema,
  })
  .openapi('ErrorResponse');
