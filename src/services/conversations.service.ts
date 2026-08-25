import { HTTPException } from 'hono/http-exception';

import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Conversation } from '@/interfaces/conversations.interface';

import { ConversationsRepository } from '@/repositories/conversations.repository';

import type { CreateConversationInput, GetConversationByIdInput } from '@/schemas/conversations.schema';

import { TransactionManager } from '@/db/transaction';

import { DocumentsService } from '@/services/documents.service';

export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly documentsService: DocumentsService,
    private readonly transactionManager: TransactionManager,
  ) {}

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    return this.transactionManager.run(async (tx) => {
      const createdConverstaion = await this.conversationsRepository.createConversation(input, tx);

      if (!createdConverstaion) {
        throw new HTTPException(HttpStatusCodes.CONFLICT, {
          message: 'The conversation could not be created',
        });
      }

      await this.documentsService.createDocumentWithContent(createdConverstaion.id, input.file, tx);

      return createdConverstaion;
    });
  }

  async getConversationById(input: GetConversationByIdInput): Promise<Conversation> {
    const conversationFound = await this.conversationsRepository.getConversationById(input);

    if (!conversationFound) {
      throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
        message: `The conversation with id ${input.id} has not been found`,
      });
    }

    return conversationFound;
  }
}
