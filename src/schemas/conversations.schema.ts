import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(255, 'Title cannot exceed 255 characters'),
  file: z
    .instanceof(File, { message: 'A file is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Max file size is 5MB')
    .refine((file) => ['application/pdf'].includes(file.type), 'Invalid file format'),
});

export const getConversationByIdSchema = z.object({ id: z.uuid() });

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type GetConverstaionByIdInput = z.infer<typeof getConversationByIdSchema>;
