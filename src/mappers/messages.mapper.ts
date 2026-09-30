import type { ChatMessage, ChatMessageRow, MessageSource, MessageSourceRow } from '@/interfaces/messages.interface';

export class MessagesMapper {
  static toChatMessage(row: ChatMessageRow): ChatMessage {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role,
      content: row.content,
      promptTokens: row.prompt_tokens,
      completionTokens: row.completion_tokens,
      createdAt: row.created_at,
    };
  }

  static toMessageSource(row: MessageSourceRow): MessageSource {
    return {
      id: row.id,
      messageId: row.message_id,
      chunkId: row.chunk_id,
      rank: row.rank,
      similarityScore: Number(row.similarity_score),
      createdAt: row.created_at,
    };
  }
}
