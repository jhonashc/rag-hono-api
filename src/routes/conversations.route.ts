import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { ConversationsRepository } from '@/repositories/conversations.repository';
import { createConversationSchema } from '@/schemas/conversations.schema';
import { ConversationsService } from '@/services/conversation.service';

const router = new Hono();

const conversationsService = new ConversationsService(
  new ConversationsRepository(),
);

router.post('/', zValidator('json', createConversationSchema), async (c) => {
  const input = c.req.valid('json');
  const conversation = await conversationsService.createConversation(input);
  return c.json(conversation, 201);
});

export default router;
