"use client";

import { useEffect, useState } from "react";

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
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  useEffect(() => {
    // only in browser
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfjsLib = require("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const renderThumbnail = async () => {
      const pdf = await pdfjsLib.getDocument(url).promise;
      const page = await pdf.getPage(pageNum);

      // get native size
      const nativeVp = page.getViewport({ scale: 1 });
      setIsLandscape(nativeVp.width > nativeVp.height);

      // compute a scale so the long edge is always 138px
      const TARGET_LONG = 138;
      const factor = TARGET_LONG / Math.max(nativeVp.width, nativeVp.height);
      const vp = page.getViewport({ scale: factor });

      // render to canvas
      const canvas = document.createElement("canvas");
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport: vp }).promise;

      setThumbUrl(canvas.toDataURL());
      onCanvasReady?.(canvas);
    };

    renderThumbnail();
  }, [url, pageNum, onCanvasReady]);

  if (!thumbUrl) return <p>Loading…</p>;

  const sizeClass = isLandscape
    ? "w-[138px] h-[100px]"
    : "w-[100px] h-[138px]";

  return (
    <img
      src={thumbUrl}
      alt={`PDF page ${pageNum}`}
      className={`rounded shadow ${sizeClass}`}
    />
  );
}
