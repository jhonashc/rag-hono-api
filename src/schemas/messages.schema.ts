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

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
