import { openai } from '@/config/openai';

const EMBEDDING_MODEL = 'liquid/lfm-2.5-embedding-350m:free';

export class EmbeddingsService {
  constructor(private readonly embeddingModel: string = EMBEDDING_MODEL) {}

  async generateEmbeddings(input: string): Promise<number[] | null> {
    const embedding = await openai.embeddings.create({
      model: this.embeddingModel,
      input,
      encoding_format: 'float',
    });

    return embedding?.data.at(0)?.embedding ?? null;
  }
}
