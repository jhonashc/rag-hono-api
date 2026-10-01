import { HTTPException } from 'hono/http-exception';

import * as HttpStatusCodes from 'stoker/http-status-codes';

import { openai } from '@/config/openai';

import type { ChatMessage, ListMessagesOptions, MessageSource, PaginatedMessages } from '@/interfaces/messages.interface';

import { ConversationsRepository } from '@/repositories/conversations.repository';
import { MessagesRepository } from '@/repositories/messages.repository';

import type { CreateMessageInput } from '@/schemas/messages.schema';

import { EmbeddingsService } from '@/services/embeddings.service';

const CHAT_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';
const TOP_K_CHUNKS = 5;

export interface SendMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  sources: MessageSource[];
}

export class MessagesService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly messagesRepository: MessagesRepository,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async getMessagesByConversationId(conversationId: string, options: ListMessagesOptions): Promise<PaginatedMessages> {
    const conversationFound = await this.conversationsRepository.getConversationById({ id: conversationId });

    if (!conversationFound) {
      throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
        message: `The conversation with id ${conversationId} has not been found`,
      });
    }

    const [messages, total] = await Promise.all([
      this.messagesRepository.getMessagesByConversationId(conversationId, options),
      this.messagesRepository.countMessagesByConversationId(conversationId),
    ]);

    return {
      messages,
      total,
      limit: options.limit,
      offset: options.offset,
      hasMore: options.offset + messages.length < total,
    };
  }

  async sendMessage(conversationId: string, input: CreateMessageInput): Promise<SendMessageResult> {
    const conversationFound = await this.conversationsRepository.getConversationById({ id: conversationId });

    if (!conversationFound) {
      throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
        message: `The conversation with id ${conversationId} has not been found`,
      });
    }

    const queryEmbedding = await this.embeddingsService.generateEmbeddings(input.content);

    if (!queryEmbedding) {
      throw new HTTPException(HttpStatusCodes.BAD_GATEWAY, {
        message: 'Failed to generate embedding for the message',
      });
    }

    const retrievedChunks = await this.messagesRepository.searchSimilarChunks(
      conversationId,
      queryEmbedding,
      TOP_K_CHUNKS,
    );

    const context = retrievedChunks.map((chunk, index) => `[${index + 1}] ${chunk.chunkText}`).join('\n\n');

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that answers questions using only the provided context. If the context does not contain the answer, say so clearly.',
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${input.content}`,
        },
      ],
    });

    const answer = completion?.choices.at(0)?.message?.content?.trim();

    if (!answer) {
      throw new HTTPException(HttpStatusCodes.BAD_GATEWAY, {
        message: 'Failed to generate a response for the message',
      });
    }

    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;

    return this.messagesRepository.createChatConversation({
      userMessage: {
        conversationId,
        role: 'user',
        content: input.content,
        promptTokens: 0,
        completionTokens: 0,
      },
      assistantMessage: {
        conversationId,
        role: 'assistant',
        content: answer,
        promptTokens,
        completionTokens,
      },
      sources: retrievedChunks.map((chunk, index) => ({
        chunkId: chunk.chunkId,
        rank: index + 1,
        similarityScore: chunk.similarity,
      })),
    });
  }
}
