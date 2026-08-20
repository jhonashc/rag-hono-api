import type {
  Conversation,
  ConversationRow,
} from '@/interfaces/conversations.interface';

export class ConversationsMapper {
  static toDomain(row: ConversationRow): Conversation {
    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static toRow(conversation: Conversation): ConversationRow {
    return {
      id: conversation.id,
      title: conversation.title,
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt,
    };
  }
}
