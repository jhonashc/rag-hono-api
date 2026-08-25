import { SQL } from 'bun';

import { HTTPException } from 'hono/http-exception';

import * as HttpStatusCodes from 'stoker/http-status-codes';

import { HashHelper } from '@/helpers/hash.helper';
import { PdfHelper } from '@/helpers/pdf.helper';

import type {
  CreateDocumentChunkWithEmbeddingInput,
  CreateDocumentPageWithChunksInput,
  Document,
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

  private async parseDocument(file: File): Promise<ParsedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const fileHash = await HashHelper.getSha256Hex(arrayBuffer);

    const { pagesText, totalPages } = await PdfHelper.extractText(arrayBuffer);

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

  private async parseDocumentIntoPages(file: File): Promise<ParsedDocument> {
    return this.parseDocument(file);
  }

  private async attachEmbeddings(pages: PageContent[]): Promise<CreateDocumentPageWithChunksInput[]> {
    const pagesWithChunks: CreateDocumentPageWithChunksInput[] = [];

    for (const page of pages) {
      const chunksWithEmbeddings: CreateDocumentChunkWithEmbeddingInput[] = [];

      for (const chunk of page.chunks) {
        const embedding = await this.embeddingsService.generateEmbeddings(chunk.chunkText);

        if (!embedding) {
          throw new HTTPException(HttpStatusCodes.BAD_GATEWAY, {
            message: `Failed to generate embedding for chunk ${chunk.chunkIndex} of page ${page.pageNumber}`,
          });
        }

        chunksWithEmbeddings.push({
          chunk: {
            chunkIndex: chunk.chunkIndex,
            chunkText: chunk.chunkText,
            startChar: chunk.startChar,
            endChar: chunk.endChar,
          },
          embedding: {
            embedding,
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

    return pagesWithChunks;
  }

  async buildDocumentContent(file: File): Promise<{
    fileName: string;
    fileHash: string;
    fileSizeBytes: number;
    totalPages: number;
    pages: CreateDocumentPageWithChunksInput[];
  }> {
    const { fileName, fileHash, fileSizeBytes, totalPages, pages } = await this.parseDocumentIntoPages(file);

    const pagesWithChunks = await this.attachEmbeddings(pages);

    return {
      fileName,
      fileHash,
      fileSizeBytes,
      totalPages,
      pages: pagesWithChunks,
    };
  }

  async createDocumentWithContent(conversationId: string, file: File, tx?: SQL): Promise<Document | null> {
    const { fileName, fileHash, fileSizeBytes, totalPages, pages } = await this.buildDocumentContent(file);

    return this.documentsRepository.createDocumentWithContent(
      {
        document: {
          conversationId,
          fileName,
          fileHash,
          fileSizeBytes,
          totalPages,
        },
        pages,
      },
      tx,
    );
  }
}
