// File parsing utility — extracts plain text from PDF and Word (.docx) files
// entirely in the browser. No server upload needed.

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure the PDF.js worker to use a CDN URL matching the installed version.
// Using import.meta.url ensures Vite bundles the worker correctly.
const pdfjsVersion = pdfjsLib.version;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

export async function parseFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
  const isDocx = name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isDoc = name.endsWith('.doc');

  if (isPdf) {
    return parsePdf(file);
  }
  if (isDocx) {
    return parseDocx(file);
  }
  if (isDoc) {
    throw new Error('Legacy .doc files are not supported. Please convert to .docx or PDF.');
  }
  // Fallback: try reading as plain text
  return file.text();
}

async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(pageText);
  }

  const text = textParts.join('\n\n');
  if (text.trim().length < 20) {
    throw new Error('Could not extract text from PDF — the file may be image-based or encrypted.');
  }
  return text;
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;
  if (text.trim().length < 20) {
    throw new Error('Could not extract text from the Word document.');
  }
  return text;
}
