import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { ConversationsRepository } from '@/repositories/conversations.repository';

import { createConversationSchema, getConversationByIdSchema } from '@/schemas/conversations.schema';

import { DocumentsRepository } from '@/repositories/documents.repository';

import { ConversationsService } from '@/services/conversations.service';
import { DocumentsService } from '@/services/documents.service';
import { ChunkingService } from '@/services/chunking.service';
import { EmbeddingsService } from '@/services/embeddings.service';

const router = new Hono();

const conversationsService = new ConversationsService(
  new ConversationsRepository(),
  new DocumentsService(new DocumentsRepository(), new ChunkingService(), new EmbeddingsService()),
);

// TODO: zValidator no cada en app.onError global
router.post('/', zValidator('form', createConversationSchema), async (c) => {
  const createConversationInput = c.req.valid('form');
  const createdConversation = await conversationsService.createConversation(createConversationInput);
  return c.json({ status: true, data: createdConversation }, 201);
});

router.get('/:id', zValidator('param', getConversationByIdSchema), async (c) => {
  const getConversationByIdInput = c.req.valid('param');
  const conversationFound = await conversationsService.getConversationById(getConversationByIdInput);
  return c.json({ status: true, data: conversationFound });
});

export default router;
