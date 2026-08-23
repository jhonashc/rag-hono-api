import type {
  ChunkEmbedding,
  ChunkEmbeddingRow,
  Document,
  DocumentChunk,
  DocumentChunkRow,
  DocumentPage,
  DocumentPageRow,
  DocumentRow,
} from '@/interfaces/documents.interface';

export class DocumentsMapper {
  static toDocument(row: DocumentRow): Document {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      fileName: row.file_name,
      fileHash: row.file_hash,
      fileSizeBytes: row.file_size_bytes,
      totalPages: row.total_pages,
      createdAt: row.created_at,
    };
  }

  static toDocumentPage(row: DocumentPageRow): DocumentPage {
    return {
      id: row.id,
      documentId: row.document_id,
      pageNumber: row.page_number,
      pageText: row.page_text,
      createdAt: row.created_at,
    };
  }

  static toDocumentChunk(row: DocumentChunkRow): DocumentChunk {
    return {
      id: row.id,
      pageId: row.page_id,
      chunkIndex: row.chunk_index,
      chunkText: row.chunk_text,
      startChar: row.start_char,
      endChar: row.end_char,
      createdAt: row.created_at,
    };
  }

  static toChunkEmbedding(row: ChunkEmbeddingRow): ChunkEmbedding {
    return {
      id: row.id,
      chunkId: row.chunk_id,
      embedding: row.embedding,
      createdAt: row.created_at,
    };
  }
}
