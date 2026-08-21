import { HTTPException } from 'hono/http-exception';

import type { Conversation } from '@/interfaces/conversations.interface';
import { ConversationsRepository } from '@/repositories/conversations.repository';
import type { CreateConversationInput, GetConverstaionByIdInput } from '@/schemas/conversations.schema';

export class ConversationsService {
  constructor(private readonly conversationsRepository: ConversationsRepository) {}

  async createConversation({ title }: CreateConversationInput): Promise<Conversation> {
    const createdConverstaion = await this.conversationsRepository.createConversation(title);

    if (!createdConverstaion) {
      throw new HTTPException(409, { message: 'The conversation could not be created' });
    }

    return createdConverstaion;
  }

  async getConversationById({ id }: GetConverstaionByIdInput): Promise<Conversation> {
    const conversationFound = await this.conversationsRepository.getConversationById(id);

    if (!conversationFound) {
      throw new HTTPException(404, { message: `The conversation with id ${id} has not been found` });
    }

    return conversationFound;
  }
}
