export type MessageRole = 'user' | 'assistant';

export interface ChatMessageRow {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  prompt_tokens: number;
  completion_tokens: number;
  created_at: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  promptTokens: number;
  completionTokens: number;
  createdAt: Date;
}

export interface CreateChatMessageInput extends Omit<ChatMessage, 'id' | 'createdAt'> {}

export interface MessageSourceRow {
  id: string;
  message_id: string;
  chunk_id: string;
  rank: number;
  similarity_score: string | number;
  created_at: Date;
}

export interface MessageSource {
  id: string;
  messageId: string;
  chunkId: string;
  rank: number;
  similarityScore: number;
  createdAt: Date;
}

export interface CreateMessageSourceInput extends Omit<MessageSource, 'id' | 'createdAt'> {}

export interface CreateChatConversationInput {
  userMessage: CreateChatMessageInput;
  assistantMessage: CreateChatMessageInput;
  sources: Omit<CreateMessageSourceInput, 'messageId'>[];
}

export interface CreatedChatConversation {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  sources: MessageSource[];
}

export interface RetrievedChunk {
  chunkId: string;
  chunkText: string;
  similarity: number;
}

export interface ListMessagesOptions {
  limit: number;
  offset: number;
}

export interface PaginatedMessages {
  messages: ChatMessage[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
