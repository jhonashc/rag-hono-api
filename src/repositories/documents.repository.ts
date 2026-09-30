import type { SQL } from 'bun';

import { sql } from '@/db/client';

import type {
  ChunkEmbedding,
  ChunkEmbeddingRow,
  CreateChunkEmbeddingInput,
  CreateDocumentChunkInput,
  CreateDocumentInput,
  CreateDocumentPageInput,
  CreateDocumentWithContentInput,
  Document,
  DocumentChunk,
  DocumentChunkRow,
  DocumentPage,
  DocumentPageRow,
  DocumentRow,
} from '@/interfaces/documents.interface';

import { DocumentsMapper } from '@/mappers/documents.mapper';

export class DocumentsRepository {
  async createDocument(input: CreateDocumentInput, tx: SQL = sql): Promise<Document | null> {
    const [row] = await tx<DocumentRow[]>`
      INSERT INTO documents (conversation_id, file_name, file_hash, file_size_bytes, total_pages)
      VALUES (${input.conversationId}, ${input.fileName}, ${input.fileHash}, ${input.fileSizeBytes}, ${input.totalPages})
      RETURNING id, conversation_id, file_name, file_hash, file_size_bytes, total_pages, created_at
    `;

    return row ? DocumentsMapper.toDocument(row) : null;
  }

  async createDocumentPage(input: CreateDocumentPageInput, tx: SQL = sql): Promise<DocumentPage | null> {
    const [row] = await tx<DocumentPageRow[]>`
      INSERT INTO document_pages (document_id, page_number, page_text)
      VALUES (${input.documentId}, ${input.pageNumber}, ${input.pageText})
      RETURNING id, document_id, page_number, page_text, created_at
    `;

    return row ? DocumentsMapper.toDocumentPage(row) : null;
  }

  async createDocumentPages(inputs: CreateDocumentPageInput[], tx: SQL = sql): Promise<DocumentPage[] | null> {
    const createdPages: DocumentPage[] = [];

    for (const pageInput of inputs) {
      const createdPage = await this.createDocumentPage(pageInput, tx);

      if (!createdPage) return null;

      createdPages.push(createdPage);
    }

    return createdPages.length > 0 ? createdPages : null;
  }

  async createDocumentChunk(input: CreateDocumentChunkInput, tx: SQL = sql): Promise<DocumentChunk | null> {
    const [row] = await tx<DocumentChunkRow[]>`
      INSERT INTO document_chunks (page_id, chunk_index, chunk_text, start_char, end_char)
      VALUES (${input.pageId}, ${input.chunkIndex}, ${input.chunkText}, ${input.startChar}, ${input.endChar})
      RETURNING id, page_id, chunk_index, chunk_text, start_char, end_char, created_at
    `;

    return row ? DocumentsMapper.toDocumentChunk(row) : null;
  }

  async createDocumentChunks(inputs: CreateDocumentChunkInput[], tx: SQL = sql): Promise<DocumentChunk[] | null> {
    const createdChunks: DocumentChunk[] = [];

    for (const chunkInput of inputs) {
      const createdChunk = await this.createDocumentChunk(chunkInput, tx);

      if (!createdChunk) return null;

      createdChunks.push(createdChunk);
    }

    return createdChunks.length > 0 ? createdChunks : null;
  }

  async createChunkEmbedding(input: CreateChunkEmbeddingInput, tx: SQL = sql): Promise<ChunkEmbedding | null> {
    const [row] = await tx<ChunkEmbeddingRow[]>`
      INSERT INTO chunk_embeddings (chunk_id, embedding)
      VALUES (${input.chunkId}, ${JSON.stringify(input.embedding)}::vector)
      RETURNING id, chunk_id, embedding, created_at
    `;

    return row ? DocumentsMapper.toChunkEmbedding(row) : null;
  }

  async createDocumentWithContent(input: CreateDocumentWithContentInput, tx: SQL = sql): Promise<Document | null> {
    const createdDocument = await this.createDocument(input.document, tx);

    if (!createdDocument) throw new Error('Failed to create document');

    const createdDocumentPages = await this.createDocumentPages(
      input.pages.map((p) => ({
        ...p.page,
        documentId: createdDocument.id,
      })),
      tx,
    );

    if (!createdDocumentPages) throw new Error('Failed to create document pages');

    for (let i = 0; i < input.pages.length; i++) {
      const createdDocumentPage = createdDocumentPages[i];
      const chunkInput = input.pages[i].chunks;

      const createdDocumentChunks = await this.createDocumentChunks(
        chunkInput.map((c) => ({
          ...c.chunk,
          pageId: createdDocumentPage.id,
        })),
        tx,
      );
      if (!createdDocumentChunks) throw new Error('Failed to create document chunks');

      for (let j = 0; j < createdDocumentChunks.length; j++) {
        await this.createChunkEmbedding(
          {
            ...chunkInput[j].embedding,
            chunkId: createdDocumentChunks[j].id,
          },
          tx,
        );
      }
    }

    return createdDocument;
  }
}
