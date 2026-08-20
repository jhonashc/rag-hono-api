import { ConversationsRepository } from '@/repositories/conversations.repository';
import type { CreateConversationInput } from '@/schemas/conversations.schema';

export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
  ) {}

  async createConversation(input: CreateConversationInput) {
    return this.conversationsRepository.createConversation(input.title);
  }
}
