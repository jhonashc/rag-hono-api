import type { SQL } from 'bun';

import { sql } from '@/db/client';

import type {
  ChatMessage,
  ChatMessageRow,
  CreateChatConversationInput,
  CreateChatMessageInput,
  CreateMessageSourceInput,
  CreatedChatConversation,
  MessageSource,
  MessageSourceRow,
  RetrievedChunk,
} from '@/interfaces/messages.interface';

import { MessagesMapper } from '@/mappers/messages.mapper';

export class MessagesRepository {
  async createChatMessage(input: CreateChatMessageInput, tx: SQL = sql): Promise<ChatMessage | null> {
    const [row] = await tx<ChatMessageRow[]>`
      INSERT INTO chat_messages (conversation_id, role, content, prompt_tokens, completion_tokens)
      VALUES (${input.conversationId}, ${input.role}, ${input.content}, ${input.promptTokens}, ${input.completionTokens})
      RETURNING id, conversation_id, role, content, prompt_tokens, completion_tokens, created_at
    `;

    return row ? MessagesMapper.toChatMessage(row) : null;
  }

  async createMessageSource(input: CreateMessageSourceInput, tx: SQL = sql): Promise<MessageSource | null> {
    const [row] = await tx<MessageSourceRow[]>`
      INSERT INTO message_sources (message_id, chunk_id, rank, similarity_score)
      VALUES (${input.messageId}, ${input.chunkId}, ${input.rank}, ${input.similarityScore})
      RETURNING id, message_id, chunk_id, rank, similarity_score, created_at
    `;

    return row ? MessagesMapper.toMessageSource(row) : null;
  }

  async createMessageSources(inputs: CreateMessageSourceInput[], tx: SQL = sql): Promise<MessageSource[]> {
    const createdSources: MessageSource[] = [];

    for (const sourceInput of inputs) {
      const createdSource = await this.createMessageSource(sourceInput, tx);

      if (!createdSource) throw new Error('Failed to create message source');

      createdSources.push(createdSource);
    }

    return createdSources;
  }

  async createChatConversation(input: CreateChatConversationInput): Promise<CreatedChatConversation> {
    return sql.begin(async (tx) => {
      const userMessage = await this.createChatMessage(input.userMessage, tx);

      if (!userMessage) throw new Error('Failed to create user message');

      const assistantMessage = await this.createChatMessage(input.assistantMessage, tx);

      if (!assistantMessage) throw new Error('Failed to create assistant message');

      const sources = await this.createMessageSources(
        input.sources.map((source) => ({ ...source, messageId: assistantMessage.id })),
        tx,
      );

      return { userMessage, assistantMessage, sources };
    });
  }

  async searchSimilarChunks(
    conversationId: string,
    queryEmbedding: number[],
    topK: number,
    tx: SQL = sql,
  ): Promise<RetrievedChunk[]> {
    const queryVector = JSON.stringify(queryEmbedding);

    const rows = await tx<Array<{ chunk_id: string; chunk_text: string; similarity: string | number }>>`
      SELECT dc.id AS chunk_id, dc.chunk_text AS chunk_text,
        1 - (ce.embedding <=> ${queryVector}::vector) AS similarity
      FROM chunk_embeddings ce
      INNER JOIN document_chunks dc ON dc.id = ce.chunk_id
      INNER JOIN document_pages dp ON dp.id = dc.page_id
      INNER JOIN documents d ON d.id = dp.document_id
      WHERE d.conversation_id = ${conversationId}
      ORDER BY ce.embedding <=> ${queryVector}::vector
      LIMIT ${topK}
    `;

    return rows.map((row) => ({
      chunkId: row.chunk_id,
      chunkText: row.chunk_text,
      similarity: Math.min(1, Math.max(0, Number(row.similarity))),
    }));
  }
}
