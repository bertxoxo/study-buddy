import fs from 'fs';
import path from 'path';
export function truncateText(text: string, maxLength: number): string { return text.length > maxLength ? text.substring(0, maxLength) : text; }
export async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  try {
    if (['txt', 'md'].includes(fileType.toLowerCase())) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    if (fileType.toLowerCase() === 'pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        return data.text;
      } catch { return 'PDF text extraction failed'; }
    }
    return 'Text extraction not supported for this file type';
  } catch (error) {
    console.error('Text extraction error:', error);
    return '';
  }
}
export function validateAndSaveUploadedFile(file: any): boolean { return !!file; }
