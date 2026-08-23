import { HashHelper } from '@/helpers/hash.helper';
import { DocumentsHelper } from '@/helpers/pdf.helper';

import type {
  CreateDocumentChunkWithEmbeddingInput,
  CreateDocumentPageWithChunksInput,
  PageContent,
  ParsedDocument,
} from '@/interfaces/documents.interface';

import { DocumentsRepository } from '@/repositories/documents.repository';

import { ChunkingService } from '@/services/chunking.service';
import { EmbeddingsService } from '@/services/embeddings.service';

export class DocumentsService {
  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  // TODO: handle expcetion
  async createDocumentWithContent(conversationId: string, file: File) {
    const { fileName, fileHash, fileSizeBytes, totalPages, pages } = await this.parseDocument(file);

    const pagesWithChunks: CreateDocumentPageWithChunksInput[] = [];

    for (const page of pages) {
      const chunksWithEmbeddings: CreateDocumentChunkWithEmbeddingInput[] = [];

      for (let i = 0; i < page.chunks.length; i++) {
        const chunk = page.chunks[i];

        const chunkEmbeddings = await this.embeddingsService.generateEmbeddings(chunk.chunkText);

        chunksWithEmbeddings.push({
          chunk: {
            chunkIndex: chunk.chunkIndex,
            chunkText: chunk.chunkText,
            startChar: chunk.startChar,
            endChar: chunk.endChar,
          },
          embedding: {
            embedding: chunkEmbeddings ?? [], // TODO: validate embedding
          },
        });
      }

      pagesWithChunks.push({
        page: {
          pageNumber: page.pageNumber,
          pageText: page.pageText,
        },
        chunks: chunksWithEmbeddings,
      });
    }

    const document = await this.documentsRepository.createDocumentWithContent({
      document: {
        conversationId,
        fileName,
        fileHash,
        fileSizeBytes,
        totalPages,
      },
      pages: pagesWithChunks,
    });

    return document;
  }

  private async parseDocument(file: File): Promise<ParsedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const fileHash = await HashHelper.getDocumentHash(arrayBuffer);

    const { pagesText, totalPages } = await DocumentsHelper.extractPdfText(arrayBuffer);

    const pages: PageContent[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const pageText = pagesText[i - 1];
      const chunks = await this.chunkingService.chunkPageText(pageText);

      pages.push({
        pageNumber: i,
        pageText,
        chunks,
      });
    }

    return {
      fileName: file.name,
      fileHash,
      fileSizeBytes: file.size,
      totalPages,
      pages,
    };
  }
}
