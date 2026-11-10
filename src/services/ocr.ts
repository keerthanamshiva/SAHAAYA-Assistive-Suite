/**
 * OCR Service Interface
 * DEMO MODE: Returns pre-defined sample text.
 * Future integration: Backend OCR API (Tesseract / Google Vision)
 */

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: OCRBlock[];
}

export interface OCRBlock {
  text: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface OCRService {
  extractText(imageData: File | Blob | string): Promise<OCRResult>;
  isSupported(): boolean;
}

const SAMPLE_PRESCRIPTION_TEXT = `Dr. Anand Mehta, MD
Date: 31/10/2026

Patient: Demo Patient

Rx:
1. Amoxicillin 500mg — 1 tablet three times daily after meals, 5 days
2. Pantoprazole 40mg — 1 tablet once daily before breakfast

Please complete the full course of antibiotics.
Follow up after 5 days if symptoms persist.

Dr. Anand Mehta`;

export class DemoOCRService implements OCRService {
  isSupported() { return true; }

  async extractText(_input: File | Blob | string): Promise<OCRResult> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1800));
    return {
      text: SAMPLE_PRESCRIPTION_TEXT,
      confidence: 0.94,
      blocks: SAMPLE_PRESCRIPTION_TEXT.split('\n').map((line, i) => ({ text: line, boundingBox: { x: 10, y: i * 24, width: 300, height: 20 } })),
    };
  }
}

// TODO: Replace with real OCR integration
export const ocrService: OCRService = new DemoOCRService();
