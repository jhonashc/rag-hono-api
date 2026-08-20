import { extractText, getDocumentProxy } from 'unpdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { DocumentsHelper } from '@/helpers/documents.helper';
import { PageChunk, PageContent } from '@/interfaces/documents.interface';

export class DocumentsService {
  constructor(
    private readonly chunkSize: number = 1000,
    private readonly chunkOverlap: number = 200,
  ) {}

  private async processDocument(file: File) {
    const arrayBuffer = await file.arrayBuffer();

    const fileName = file.name;
    const fileSizeBytes = file.size;
    const fileHash = await DocumentsHelper.getDocumentHash(arrayBuffer);

    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap,
    });

    const pagesContent: PageContent[] = [];

    const { text: pagesText, totalPages } = await extractText(pdf, {
      mergePages: false,
    });

    for (let i = 1; i <= totalPages; i++) {
      const pageText = pagesText[i - 1];

      const pageChunks: PageChunk[] = [];

      const splitDocs = await textSplitter.createDocuments([pageText]);

      let searchCursor = 0;

      for (let chunkIndex = 0; chunkIndex < splitDocs.length; chunkIndex++) {
        const chunkText = splitDocs[chunkIndex].pageContent;

        const startChar = pageText.indexOf(chunkText, searchCursor);
        const endChar = startChar !== -1 ? startChar + chunkText.length : 0;

        if (startChar !== -1) {
          searchCursor = startChar + 1;
        }

        pageChunks.push({
          chunkIndex: chunkIndex,
          chunkText,
          startChar: Math.max(0, startChar),
          endChar,
        });
      }

      pagesContent.push({
        pageNumber: i,
        pageText,
        chunks: pageChunks,
      });
    }

    return {
      fileName: fileName,
      fileHash: fileHash,
      fileSizeBytes: fileSizeBytes,
      totalPages: totalPages,
      pages: pagesContent,
    };
  }
}
