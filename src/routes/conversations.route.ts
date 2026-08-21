import { Hono } from 'hono';

import { validateRequest } from '@/middlewares/validate-request.middleware';
import { ConversationsRepository } from '@/repositories/conversations.repository';
import { createConversationSchema, getConversationByIdSchema } from '@/schemas/conversations.schema';
import { ConversationsService } from '@/services/conversation.service';

const router = new Hono();

const conversationsService = new ConversationsService(new ConversationsRepository());

router.post('/', validateRequest(createConversationSchema), async (c) => {
  const { json } = c.get('validated');
  const createdConversation = await conversationsService.createConversation(json);
  return c.json({ status: true, data: createdConversation }, 201);
});

router.get('/:id', validateRequest(getConversationByIdSchema), async (c) => {
  const { param } = c.get('validated');
  const conversationFound = await conversationsService.getConversationById(param);
  return c.json({ status: true, data: conversationFound });
});

export default router;
