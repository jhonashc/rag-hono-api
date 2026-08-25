import { z } from '@hono/zod-openapi';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const createConversationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title cannot exceed 255 characters')
    .openapi({ example: 'My conversation' }),

  file: z
    .instanceof(File, { message: 'A file is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB')
    .refine((file) => file.type === 'application/pdf', 'Invalid file format')
    .openapi({
      type: 'string',
      format: 'binary',
      description: 'PDF file, maximum 5MB',
    }),
});

export const getConversationByIdSchema = z.object({
  id: z.uuid().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
  }),
});

export const conversationSchema = z
  .object({
    id: z.uuid(),
    title: z.string(),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),
  })
  .openapi('Conversation');

export const createConversationResponseSchema = z.object({
  status: z.literal(true),
  data: conversationSchema,
});

export const getConversationByIdResponseSchema = z.object({
  status: z.literal(true),
  data: conversationSchema,
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type GetConversationByIdInput = z.infer<typeof getConversationByIdSchema>;
