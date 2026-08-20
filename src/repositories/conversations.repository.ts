import { sql } from '@/db/client';
import type {
  Conversation,
  ConversationRow,
} from '@/interfaces/conversations.interface';
import { ConversationsMapper } from '@/mappers/conversations.mapper';

export class ConversationsRepository {
  constructor() {}

  async createConversation(title: string): Promise<Conversation> {
    const query = `
        INSERT INTO conversations (title)
        VALUES ($1)
        RETURNING id, title, created_at, updated_at
    `;

    const [row] = await sql.unsafe<ConversationRow[]>(query, [title]);

    return ConversationsMapper.toDomain(row);
  }
}
