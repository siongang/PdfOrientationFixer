"use client";

import { useEffect, useState } from "react";
import {  PDFPageProxy } from "pdfjs-dist";
export default function PDFPageCanvas({
  url,
  pageDoc,
  pageNum,
  scale = 1,
  onCanvasReady,
}: {
  url: string;
  pageDoc: PDFPageProxy;
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

    const renderElements = async () => {
      const page = pageDoc;
      const renderThumbnail = async () => {
        // get native size
        const nativeVp = page.getViewport({ scale: 1 });
        setIsLandscape(nativeVp.width > nativeVp.height);

        //   // compute a scale so the long edge is always 138px
        //   const TARGET_LONG = 138;
        //   const factor = TARGET_LONG / Math.max(nativeVp.width, nativeVp.height);
        const vp = page.getViewport({ scale: scale });

        // render to canvas
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;

        setThumbUrl(canvas.toDataURL());
        onCanvasReady?.(canvas);
      };
      const renderCanvasForOCR = async () => {
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext("2d");
        if (!context) return;

        await page.render({ canvasContext: context, viewport }).promise;

        if (onCanvasReady) onCanvasReady(canvas);
      };
      
      await Promise.all([renderThumbnail(), renderCanvasForOCR()]);
      // renderThumbnail();
      // renderCanvasForOCR();
    };
    console.log("rendering thumnail for page", pageNum);
    renderElements();
    console.log("finished rendering thumnail for page", pageNum);
  }, [url, pageNum]);

  if (!thumbUrl) return <p>Loading…</p>;

  const sizeClass = isLandscape ? "w-[138px] h-[100px]" : "w-[100px] h-[138px]";

  return (
    <img
      src={thumbUrl}
      alt={`PDF page ${pageNum}`}
      className={`rounded shadow ${sizeClass}`}
    />
  );
}
