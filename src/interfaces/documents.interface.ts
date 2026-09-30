export interface PageChunk {
  chunkIndex: number;
  chunkText: string;
  startChar: number;
  endChar: number;
}

export interface PageContent {
  pageNumber: number;
  pageText: string;
  chunks: PageChunk[];
}

export interface ParsedDocument {
  fileName: string;
  fileHash: string;
  fileSizeBytes: number;
  totalPages: number;
  pages: PageContent[];
}

export interface DocumentRow {
  id: string;
  conversation_id: string;
  file_name: string;
  file_hash: string;
  file_size_bytes: number;
  total_pages: number;
  created_at: Date;
}

export interface Document {
  id: string;
  conversationId: string;
  fileName: string;
  fileHash: string;
  fileSizeBytes: number;
  totalPages: number;
  createdAt: Date;
}

export interface CreateDocumentInput extends Omit<Document, 'id' | 'createdAt'> {}

export interface DocumentPageRow {
  id: string;
  document_id: string;
  page_number: number;
  page_text: string;
  created_at: Date;
}

export interface DocumentPage {
  id: string;
  documentId: string;
  pageNumber: number;
  pageText: string;
  createdAt: Date;
}

export interface CreateDocumentPageInput extends Omit<DocumentPage, 'id' | 'createdAt'> {}

export interface DocumentChunkRow {
  id: string;
  page_id: string;
  chunk_index: number;
  chunk_text: string;
  start_char: number;
  end_char: number;
  created_at: Date;
}

export interface DocumentChunk {
  id: string;
  pageId: string;
  chunkIndex: number;
  chunkText: string;
  startChar: number;
  endChar: number;
  createdAt: Date;
}

export interface CreateDocumentChunkInput extends Omit<DocumentChunk, 'id' | 'createdAt'> {}

export interface ChunkEmbeddingRow {
  id: string;
  chunk_id: string;
  embedding: number[];
  created_at: Date;
}

export interface ChunkEmbedding {
  id: string;
  chunkId: string;
  embedding: number[];
  createdAt: Date;
}

export interface CreateChunkEmbeddingInput extends Omit<ChunkEmbedding, 'id' | 'createdAt'> {}

export interface CreateDocumentWithContentInput {
  document: CreateDocumentInput;
  pages: CreateDocumentPageWithChunksInput[];
}

export interface CreateDocumentPageWithChunksInput {
  page: Omit<CreateDocumentPageInput, 'documentId'>;
  chunks: CreateDocumentChunkWithEmbeddingInput[];
}

export interface CreateDocumentChunkWithEmbeddingInput {
  chunk: Omit<CreateDocumentChunkInput, 'pageId'>;
  embedding: Omit<CreateChunkEmbeddingInput, 'chunkId'>;
}
