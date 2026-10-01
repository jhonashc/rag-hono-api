import { z } from '@hono/zod-openapi';

export const createMessageSchema = z.object({
  content: z.string().trim().min(1, 'Content cannot be empty').openapi({ example: 'What is this document about?' }),
});

export const messageRoleSchema = z.enum(['user', 'assistant']).openapi({ example: 'assistant' });

export const chatMessageSchema = z
  .object({
    id: z.uuid(),
    role: messageRoleSchema,
    content: z.string(),
    promptTokens: z.number().int(),
    completionTokens: z.number().int(),
    createdAt: z.date(),
  })
  .openapi('ChatMessage');

export const messageSourceSchema = z
  .object({
    id: z.uuid(),
    chunkId: z.uuid(),
    rank: z.number().int(),
    similarityScore: z.number(),
    createdAt: z.date(),
  })
  .openapi('MessageSource');

export const createMessageResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    userMessage: chatMessageSchema,
    assistantMessage: chatMessageSchema,
    sources: z.array(messageSourceSchema),
  }),
});

export const listMessagesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .openapi({
      param: {
        name: 'limit',
        in: 'query',
      },
      example: 20,
      description: 'Maximum number of messages to return',
    }),
  offset: z.coerce
    .number()
    .int()
    .min(0)
    .default(0)
    .openapi({
      param: {
        name: 'offset',
        in: 'query',
      },
      example: 0,
      description: 'Number of messages to skip',
    }),
});

export const listMessagesMetaSchema = z
  .object({
    total: z.number().int().min(0),
    limit: z.number().int(),
    offset: z.number().int(),
    hasMore: z.boolean(),
  })
  .openapi('ListMessagesMeta');

export const listMessagesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(chatMessageSchema),
  meta: listMessagesMetaSchema,
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type ListMessagesQueryInput = z.infer<typeof listMessagesQuerySchema>;
