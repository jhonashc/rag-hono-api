import { HTTPException } from 'hono/http-exception';

import type { Conversation } from '@/interfaces/conversations.interface';

import { ConversationsRepository } from '@/repositories/conversations.repository';

import type { CreateConversationInput, GetConverstaionByIdInput } from '@/schemas/conversations.schema';

import { DocumentsService } from '@/services/documents.service';

export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly documentsService: DocumentsService,
  ) {}

  // TODO: create transaction
  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const createdConverstaion = await this.conversationsRepository.createConversation(input);

    if (!createdConverstaion) {
      throw new HTTPException(409, { message: 'The conversation could not be created' });
    }

    const createdDocument = await this.documentsService.createDocumentWithContent(createdConverstaion.id, input.file);
    console.log('createdDocument', createdDocument);

    return createdConverstaion;
  }

  async getConversationById(input: GetConverstaionByIdInput): Promise<Conversation> {
    const conversationFound = await this.conversationsRepository.getConversationById(input);

    if (!conversationFound) {
      throw new HTTPException(404, {
        message: `The conversation with id ${input.id} has not been found`,
      });
    }

    return conversationFound;
  }
}
