import { sql } from '@/db/client';

import type { Conversation, ConversationRow } from '@/interfaces/conversations.interface';

import { ConversationsMapper } from '@/mappers/conversations.mapper';

import type { CreateConversationInput, GetConverstaionByIdInput } from '@/schemas/conversations.schema';

export class ConversationsRepository {
  async createConversation(input: CreateConversationInput): Promise<Conversation | null> {
    const [row] = await sql<ConversationRow[]>`
      INSERT INTO conversations (title)
      VALUES (${input.title})
      RETURNING id, title, created_at, updated_at
    `;

    return row ? ConversationsMapper.toConversation(row) : null;
  }

  async getConversationById(input: GetConverstaionByIdInput): Promise<Conversation | null> {
    const [row] = await sql<ConversationRow[]>`
      SELECT id, title, created_at, updated_at
      FROM conversations
      WHERE id = ${input.id}
    `;

    return row ? ConversationsMapper.toConversation(row) : null;
  }
}
