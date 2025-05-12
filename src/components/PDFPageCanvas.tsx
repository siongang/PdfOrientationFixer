"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"; // Or the path to your worker on a CDN

export default function PDFPageCanvas({
  url,
  pageNum,
  scale = 1,
  onCanvasReady,
}: {
  url: string;
  pageNum: number;
  scale?: number;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  
  useEffect(() => {
    const renderThumbnail = async () => {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      if (!context) return;

      await page.render({ canvasContext: context, viewport }).promise;

      // Get PNG data URL
      const dataUrl = canvas.toDataURL("image/png");
      setThumbUrl(dataUrl);
    };
    const renderCanvasForOCR = async () => {
      const pdf = await pdfjsLib.getDocument(url).promise;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      if (!context) return;

      await page.render({ canvasContext: context, viewport }).promise;

      if (onCanvasReady) onCanvasReady(canvas);
    };

    renderThumbnail();
    renderCanvasForOCR();
  }, [url, pageNum, scale, onCanvasReady]);

  if (!thumbUrl) return <p>Loading...</p>;

  return (
    <img
      src={thumbUrl}
      alt={`PDF page ${pageNum} thumbnail`}
      className="w-[100px] h-[138px]  rounded shadow"
    />
  );
}
