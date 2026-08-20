export interface PageContent {
  pageNumber: number;
  pageText: string;
  chunks: PageChunk[];
}

export interface PageChunk {
  chunkIndex: number;
  chunkText: string;
  startChar: number;
  endChar: number;
}
