import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import type { PageChunk } from '@/interfaces/documents.interface';

export class ChunkingService {
  constructor(
    private readonly chunkSize: number = 1000,
    private readonly chunkOverlap: number = 200,
  ) {}

  async chunkPageText(pageText: string): Promise<PageChunk[]> {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap,
    });

    const splitDocs = await textSplitter.createDocuments([pageText]);

    const chunks: PageChunk[] = [];

    let searchCursor = 0;

    for (let chunkIndex = 0; chunkIndex < splitDocs.length; chunkIndex++) {
      const chunkText = splitDocs[chunkIndex].pageContent;
      const startChar = pageText.indexOf(chunkText, searchCursor);
      const endChar = startChar !== -1 ? startChar + chunkText.length : 0;

      if (startChar !== -1) {
        searchCursor = startChar + 1;
      }

      chunks.push({
        chunkIndex,
        chunkText,
        startChar: Math.max(0, startChar),
        endChar,
      });
    }

    return chunks;
  }
}
