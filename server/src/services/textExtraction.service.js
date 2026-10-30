import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

/**
 * Custom Error classes for extraction domain errors
 */
export class ExtractionError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message);
    this.name = 'ExtractionError';
    this.code = code;
    this.statusCode = statusCode;
    this.status = statusCode;
  }
}

/**
 * Clean and normalize extracted text
 * @param {string} raw
 * @returns {string}
 */
export function cleanText(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null bytes or non-printable ASCII (except tabs and newlines)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace 3+ consecutive newlines with 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract text from a PDF file using pdf-parse
 * @param {string} filePath - Absolute path to PDF file
 * @returns {Promise<{ text: string, pagesCount: number }>}
 */
async function extractFromPdf(filePath) {
  let fileBuffer;
  try {
    fileBuffer = fs.readFileSync(filePath);
  } catch (err) {
    throw new ExtractionError(
      `Failed to read file from disk: ${err.message}`,
      'FILE_READ_ERROR',
      404
    );
  }

  // Check 0-byte document
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new ExtractionError(
      'Document file is empty (0 bytes).',
      'EMPTY_DOCUMENT',
      422
    );
  }

  // Verify PDF header magic bytes
  const header = fileBuffer.slice(0, 5).toString('ascii');
  if (!header.startsWith('%PDF')) {
    throw new ExtractionError(
      'File does not have a valid PDF header structure or is corrupted.',
      'CORRUPTED_PDF',
      400
    );
  }

  let parser;
  try {
    parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();

    // Prefer per-page text array if available to avoid header/footer artifacts
    let rawText = '';
    if (Array.isArray(result?.pages) && result.pages.length > 0) {
      rawText = result.pages.map((p) => p.text?.trim()).filter(Boolean).join('\n\n');
    }
    if (!rawText && result?.text) {
      // Remove page number footers like "-- 1 of 1 --"
      rawText = result.text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '').trim();
    }

    const pagesCount = result?.total || result?.pages?.length || 1;

    return {
      text: cleanText(rawText),
      pagesCount,
    };
  } catch (err) {
    if (err instanceof ExtractionError) throw err;
    throw new ExtractionError(
      `PDF file is corrupted or could not be parsed: ${err.message}`,
      'CORRUPTED_PDF',
      400
    );
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy().catch(() => {});
    }
  }
}

/**
 * Extract text from a DOCX file using mammoth
 * @param {string} filePath - Absolute path to DOCX file
 * @returns {Promise<{ text: string }>}
 */
async function extractFromDocx(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new ExtractionError('Document file not found on server.', 'FILE_NOT_FOUND', 404);
  }

  let fileBuffer;
  try {
    fileBuffer = fs.readFileSync(filePath);
  } catch (err) {
    throw new ExtractionError(
      `Failed to read file from disk: ${err.message}`,
      'FILE_READ_ERROR',
      404
    );
  }

  // Check 0-byte document
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new ExtractionError(
      'Document file is empty (0 bytes).',
      'EMPTY_DOCUMENT',
      422
    );
  }

  // Verify DOCX ZIP header (PK signature: 0x50, 0x4B)
  const isZip = fileBuffer.length >= 4 && fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b;
  if (!isZip) {
    throw new ExtractionError(
      'Word document is corrupted or not a valid DOCX container format.',
      'CORRUPTED_DOCX',
      400
    );
  }

  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const rawText = result?.value || '';

    return {
      text: cleanText(rawText),
      messages: result?.messages || [],
    };
  } catch (err) {
    if (err instanceof ExtractionError) throw err;
    throw new ExtractionError(
      `DOCX document is corrupted or invalid: ${err.message}`,
      'CORRUPTED_DOCX',
      400
    );
  }
}

/**
 * Main Extraction Service Function
 * Handles PDF & DOCX, validates content, and flags empty or corrupt documents
 *
 * @param {string} filePath - Path to document on disk
 * @param {string} originalName - Original filename with extension
 * @returns {Promise<{ text: string, wordCount: number, characterCount: number, pagesCount?: number }>}
 */
export async function extractResumeDocumentText(filePath, originalName) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new ExtractionError('Resume file does not exist at specified path.', 'FILE_NOT_FOUND', 404);
  }

  const ext = path.extname(originalName || filePath).toLowerCase();
  let extractionResult;

  if (ext === '.pdf') {
    extractionResult = await extractFromPdf(filePath);
  } else if (ext === '.docx') {
    extractionResult = await extractFromDocx(filePath);
  } else {
    throw new ExtractionError(
      `Unsupported file type "${ext}". Only PDF (.pdf) and Word documents (.docx) are supported.`,
      'UNSUPPORTED_FORMAT',
      400
    );
  }

  const text = extractionResult.text;

  // Handle Empty Documents (zero characters or purely non-letter whitespace)
  if (!text || text.length === 0 || !/[a-zA-Z0-9]/.test(text)) {
    throw new ExtractionError(
      'Document contains no extractable text. The file may be blank or composed solely of scanned image pages without OCR.',
      'EMPTY_DOCUMENT',
      422
    );
  }

  // Calculate statistics
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const characterCount = text.length;

  return {
    text,
    wordCount,
    characterCount,
    pagesCount: extractionResult.pagesCount || 1,
  };
}

export default {
  extractResumeDocumentText,
  ExtractionError,
  cleanText,
};
