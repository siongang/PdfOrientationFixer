import { PDFDocument } from 'pdf-lib';

async function downloadRotatedPDF(fileEntry: FileEntry) {
  const pdfDoc = await PDFDocument.create();

  for (const pageInfo of fileEntry.pages) {
    const existingPdfBytes = await fetch(fileEntry.publicUrl).then(res => res.arrayBuffer());
    const existingPdf = await PDFDocument.load(existingPdfBytes);
    const [copiedPage] = await pdfDoc.copyPages(existingPdf, [pageInfo.pageNum - 1]);

    copiedPage.setRotation(degreesToRadians(pageInfo.rotation));
    pdfDoc.addPage(copiedPage);
  }

  const pdfBytes = await pdfDoc.save();

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'rotated.pdf';
  link.click();
}

function degreesToRadians(deg: number) {
  return (deg * Math.PI) / 180;
}
