import { HTTPException } from 'hono/http-exception';

import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Conversation } from '@/interfaces/conversations.interface';

import { ConversationsRepository } from '@/repositories/conversations.repository';

import type { CreateConversationInput, GetConversationByIdInput } from '@/schemas/conversations.schema';

export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository
  ) {}

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const createdConverstaion = await this.conversationsRepository.createConversation(input);

    if (!createdConverstaion) {
      throw new HTTPException(HttpStatusCodes.CONFLICT, {
        message: 'The conversation has not been created',
      });
    }

    return createdConverstaion;
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
