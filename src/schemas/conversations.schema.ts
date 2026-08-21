import { z } from 'zod';

export const createConversationSchema = z.object({
  json: z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(255, 'Title cannot exceed 255 characters'),
  }),
});

export const getConversationByIdSchema = z.object({
  param: z.object({ id: z.uuid() }),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>['json'];
export type GetConverstaionByIdInput = z.infer<typeof getConversationByIdSchema>['param'];
