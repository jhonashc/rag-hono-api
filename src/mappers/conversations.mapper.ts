import type { Conversation, ConversationRow } from '@/interfaces/conversations.interface';

export class ConversationsMapper {
  static toConversation(row: ConversationRow): Conversation {
    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
