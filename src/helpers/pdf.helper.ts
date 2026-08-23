import { extractText, getDocumentProxy } from 'unpdf';

interface PdfExtractionResult {
  pagesText: string[];
  totalPages: number;
}

export class DocumentsHelper {
  static async extractPdfText(arrayBuffer: ArrayBuffer): Promise<PdfExtractionResult> {
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));

    const { text: pagesText, totalPages } = await extractText(pdf, {
      mergePages: false,
    });

    return { pagesText, totalPages };
  }
}
