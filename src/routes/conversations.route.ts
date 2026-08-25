import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import * as HttpStatusCodes from 'stoker/http-status-codes';

import { TransactionManager } from '@/db/transaction';

import { ConversationsRepository } from '@/repositories/conversations.repository';

import {
  getConversationByIdResponseSchema,
  createConversationSchema,
  getConversationByIdSchema,
  createConversationResponseSchema,
} from '@/schemas/conversations.schema';
import { errorResponseSchema } from '@/schemas/error.schema';

import { DocumentsRepository } from '@/repositories/documents.repository';

import { ConversationsService } from '@/services/conversations.service';
import { DocumentsService } from '@/services/documents.service';
import { ChunkingService } from '@/services/chunking.service';
import { EmbeddingsService } from '@/services/embeddings.service';

const router = new OpenAPIHono();

const conversationsService = new ConversationsService(
  new ConversationsRepository(),
  new DocumentsService(new DocumentsRepository(), new ChunkingService(), new EmbeddingsService()),
  new TransactionManager(),
);

const createConversationRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Conversations'],
  summary: 'Create a conversation from a PDF',
  description: 'Creates a new conversation by uploading a PDF file.',
  operationId: 'createConversation',
  request: {
    body: {
      required: true,
      description: 'Conversation data and the PDF file to process.',
      content: {
        'multipart/form-data': {
          schema: createConversationSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: {
      description: 'Conversation created successfully',
      content: {
        'application/json': {
          schema: createConversationResponseSchema,
        },
      },
    },
    [HttpStatusCodes.BAD_REQUEST]: {
      description: 'Invalid request data or file',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

router.openapi(createConversationRoute, async (c) => {
  const createConversationInput = c.req.valid('form');
  const createdConversation = await conversationsService.createConversation(createConversationInput);
  return c.json({ status: true, data: createdConversation }, HttpStatusCodes.CREATED);
});

const getConversationByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Conversations'],
  summary: 'Get a conversation by ID',
  description: 'Retrieves a conversation using its unique identifier.',
  operationId: 'getConversationById',
  request: {
    params: getConversationByIdSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: 'Conversation retrieved successfully',
      content: {
        'application/json': {
          schema: getConversationByIdResponseSchema,
        },
      },
    },
    [HttpStatusCodes.NOT_FOUND]: {
      description: 'Conversation not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

router.openapi(getConversationByIdRoute, async (c) => {
  const getConversationByIdInput = c.req.valid('param');
  const conversationFound = await conversationsService.getConversationById(getConversationByIdInput);
  return c.json({ status: true, data: conversationFound }, HttpStatusCodes.OK);
});

export default router;
