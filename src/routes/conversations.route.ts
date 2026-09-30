import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { HTTPException } from 'hono/http-exception';

import * as HttpStatusCodes from 'stoker/http-status-codes';

import { TransactionManager } from '@/db/transaction';

import { ConversationsRepository } from '@/repositories/conversations.repository';

import {
  createConversationSchema,
  getConversationByIdSchema,
  createConversationResponseSchema,
  createConversationDocumentSchema,
} from '@/schemas/conversations.schema';
import { createMessageResponseSchema, createMessageSchema } from '@/schemas/messages.schema';
import { createDocumentResponseSchema } from '@/schemas/documents.schema';
import { errorResponseSchema } from '@/schemas/error.schema';

import { DocumentsRepository } from '@/repositories/documents.repository';
import { MessagesRepository } from '@/repositories/messages.repository';

import { ConversationsService } from '@/services/conversations.service';
import { DocumentsService } from '@/services/documents.service';
import { ChunkingService } from '@/services/chunking.service';
import { EmbeddingsService } from '@/services/embeddings.service';
import { MessagesService } from '@/services/messages.service';

const router = new OpenAPIHono();

const documentsService = new DocumentsService(
  new DocumentsRepository(),
  new ChunkingService(),
  new EmbeddingsService(),
);

const conversationsService = new ConversationsService(
  new ConversationsRepository(),
  documentsService,
  new TransactionManager(),
);

const messagesService = new MessagesService(
  new ConversationsRepository(),
  new MessagesRepository(),
  new EmbeddingsService(),
  new TransactionManager(),
);

const createConversationRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Conversations'],
  summary: 'Create a conversation',
  description: 'Creates a new conversation with a title.',
  operationId: 'createConversation',
  request: {
    body: {
      required: true,
      description: 'Conversation data.',
      content: {
        'application/json': {
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
      description: 'Invalid request data',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

router.openapi(createConversationRoute, async (c) => {
  const createdConversation = await conversationsService.createConversation(c.req.valid('json'));

  return c.json(
    {
      success: true,
      data: createdConversation,
    },
    HttpStatusCodes.CREATED,
  );
});

const createConversationDocumentRoute = createRoute({
  method: 'post',
  path: '/:id/documents',
  tags: ['Conversations'],
  summary: 'Upload a conversation document',
  description: 'Uploads a PDF document to a conversation, splits it into chunks and generates embeddings.',
  operationId: 'uploadConversationDocument',
  request: {
    params: getConversationByIdSchema,
    body: {
      required: true,
      description: 'PDF file, maximum 5MB.',
      content: {
        'multipart/form-data': {
          schema: createConversationDocumentSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: {
      description: 'Document uploaded successfully',
      content: {
        'application/json': {
          schema: createDocumentResponseSchema,
        },
      },
    },
    [HttpStatusCodes.BAD_REQUEST]: {
      description: 'Invalid request data',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

router.openapi(createConversationDocumentRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { file } = c.req.valid('form');

  const createdDocumentWithContent = await documentsService.createDocumentWithContent(id, file);

  if (!createdDocumentWithContent) {
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'The document has not been created',
    });
  }

  return c.json(
    {
      success: true,
      data: createdDocumentWithContent,
    },
    HttpStatusCodes.CREATED,
  );
});

const createMessageRoute = createRoute({
  method: 'post',
  path: '/:id/messages',
  tags: ['Conversations'],
  summary: 'Send a message',
  description:
    'Sends a user message, retrieves relevant document chunks, generates an assistant answer and stores both messages with their sources.',
  operationId: 'sendConversationMessage',
  request: {
    params: getConversationByIdSchema,
    body: {
      required: true,
      description: 'Message data.',
      content: {
        'application/json': {
          schema: createMessageSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: {
      description: 'Message answered successfully',
      content: {
        'application/json': {
          schema: createMessageResponseSchema,
        },
      },
    },
    [HttpStatusCodes.BAD_REQUEST]: {
      description: 'Invalid request data',
      content: {
        'application/json': {
          schema: errorResponseSchema,
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

router.openapi(createMessageRoute, async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');

  const result = await messagesService.sendMessage(id, body);

  return c.json(
    {
      success: true,
      data: result,
    },
    HttpStatusCodes.CREATED,
  );
});

export default router;
