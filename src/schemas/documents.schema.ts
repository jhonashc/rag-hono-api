import { z } from '@hono/zod-openapi';

export const documentSchema = z
  .object({
    id: z.uuid(),
    conversationId: z.uuid(),
    fileName: z.string(),
    fileHash: z.string(),
    fileSizeBytes: z.number().int(),
    totalPages: z.number().int(),
    createdAt: z.date(),
  })
  .openapi('Document');

export const createDocumentResponseSchema = z.object({
  success: z.literal(true),
  data: documentSchema,
});
