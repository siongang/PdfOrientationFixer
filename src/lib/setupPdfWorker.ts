// lib/setupPdfWorker.ts
import { GlobalWorkerOptions } from 'pdfjs-dist'

export function setupPdfWorker() {
  const workerBlob = new Blob(
    [
      `
        importScripts('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.2.133/build/pdf.worker.min.js');
      `
    ],
    { type: 'application/javascript' }
  )

  const workerBlobUrl = URL.createObjectURL(workerBlob)
  GlobalWorkerOptions.workerSrc = workerBlobUrl
}
