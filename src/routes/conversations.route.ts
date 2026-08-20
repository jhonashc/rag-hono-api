import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { ConversationsRepository } from '@/repositories/conversations.repository';
import { createConversationSchema } from '@/schemas/conversations.schema';
import { ConversationsService } from '@/services/conversation.service';

const router = new Hono();

const conversationsService = new ConversationsService(new ConversationsRepository());

router.post('/', zValidator('json', createConversationSchema), async (c) => {
  const input = c.req.valid('json');
  const createdConversation = await conversationsService.createConversation(input);
  return c.json(createdConversation, 201);
});

export default router;
