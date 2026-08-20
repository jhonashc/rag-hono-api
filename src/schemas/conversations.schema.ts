import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(255, 'Title cannot exceed 255 characters'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
