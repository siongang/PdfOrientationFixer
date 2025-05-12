import { PDFDocument, degrees } from "pdf-lib";
import { readFile, writeFile } from 'fs/promises';


const test_pdf_path = 'test_pdf.pdf';
const pdfBuffer = await readFile(test_pdf_path);
console.log('Original PDF Buffer:', pdfBuffer);
const rotatedPdfBuffer = await rotateAllPages(pdfBuffer, 90);
await writeFile(test_pdf_path, rotatedPdfBuffer)

/**
 * Rotates a single page in a PDF buffer.
 * @param pdfBuffer - The PDF file as a buffer.
 * @param pageIndex - The page index to rotate (0-based).
 * @param degree - Degrees to rotate (e.g., 90, 180, 270).
 * @returns A new PDF buffer with the specified page rotated.
 */
export async function rotateSinglePage(
  pdfBuffer: Buffer,
  pageIndex: number,
  degree: number
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  if (pageIndex >= 0 && pageIndex < pages.length) {
    pages[pageIndex].setRotation(degrees(degree));
  }
  const pdfBytes = await pdfDoc.save(); // This returns Uint8Array

  return Buffer.from(pdfBytes);
}

/**
 * Rotates all pages in a PDF buffer by a specified degree.
 * @param pdfBuffer - The PDF file as a buffer.
 * @param degree - Degrees to rotate all pages (e.g., 90, 180, 270).
 * @returns A new PDF buffer with all pages rotated.
 */
export async function rotateAllPages(
  pdfBuffer: Buffer,
  degree: number
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    page.setRotation(degrees(degree));
  }
  const pdfBytes = await pdfDoc.save(); // This returns Uint8Array

  return Buffer.from(pdfBytes);
}


