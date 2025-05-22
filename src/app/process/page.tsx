"use client";

import { supabase } from "../../lib/supabaseClient.ts";
import { useSearchParams } from "next/navigation";

import { useEffect, useMemo, useState } from "react";
import PDFPageCanvas from "../../components/PDFPageCanvas.tsx";
import PageControls from "../../components/PageControls.tsx";
import { detectBestOrientation } from "./detectTextOrientationWithOCR.ts";

import { RotateCw } from "lucide-react";

import { PDFDocument, degrees } from "pdf-lib";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

// import { get } from "node:http";

export default function ProcessPage() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("ids");
  const fileIds = useMemo(() => (raw ? JSON.parse(raw) : []), [raw]);
  // const [publicFileUrls, setPublicFileUrls] = useState<string[]>([]);

  type PageInfo = {
    pageDoc: PDFPageProxy;
    pageNum: number;
    rotation: number;
    origRotation: number; // Original rotation from the PDF
    width: number;
    height: number;
    orientation: "portrait" | "landscape";
  };

  type FileEntry = {
    id: string;
    publicUrl: string;
    pdfDoc?: PDFDocumentProxy;
    pages: PageInfo[];
  };
  type FileData = Record<string, FileEntry>;

  const [fileMap, setFileMap] = useState<FileData>({});
  const [defaultFileMap, setDefaultFileMap] = useState<FileData>({});

  const canvasRefs = useMemo(
    () => ({} as Record<string, HTMLCanvasElement>),
    []
  );

  function registerCanvas(key: string, canvas: HTMLCanvasElement) {
    if (!canvasRefs[key]) {
      canvasRefs[key] = canvas;
    }
  }

  useEffect(() => {
    const buildFileMap = async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfjsLib = require("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      console.log("building file map", fileIds);
      // Parent Div
      const newMap: FileData = {};
      for (const id of fileIds) {
        const url = supabase.storage.from("files").getPublicUrl(id)
          .data.publicUrl;

        const pdf = await pdfjsLib.getDocument(url).promise;
        const numPages = pdf.numPages;
        // List of PageInfo objects
        const pageData: PageInfo[] = [];

        const getPageData = async (numPages: number, batchSize: number) => {
          for (let i = 1; i <= numPages; i += batchSize) {
            const batch = Array.from(
              { length: batchSize },
              (_, index) => i + index
            ).filter((pageNum) => pageNum <= numPages);

            console.time("batch");
            const promises = batch.map(async (pageNum) => {
              const page = await pdf.getPage(pageNum);
              const origRotation = page.rotate;
              const viewport = page.getViewport({ scale: 1 }); // scale=1 gives actual size
              const width = viewport.width;
              const height = viewport.height;
              const orientation =
                width > height
                  ? "landscape"
                  : ("portrait" as "landscape" | "portrait");
              return {
                pageDoc: page,
                pageNum: pageNum,
                rotation: 0,
                origRotation,
                width,
                height,
                orientation,
              } as PageInfo;
            });

            const renderedBatchedPages: PageInfo[] = await Promise.all(
              promises
            );
            console.timeEnd("batch"); // logs duration of each batch
            pageData.push(...renderedBatchedPages);
          }

          return pageData;
        };

        await getPageData(numPages, 5);

        // for (let i = 1; i <= numPages; i++) {
        //   const page = await pdf.getPage(i);
        //   const origRotation = page.rotate;
        //   const viewport = page.getViewport({ scale: 1 }); // scale=1 gives actual size
        //   const width = viewport.width;
        //   const height = viewport.height;
        //   const orientation = width > height ? "landscape" : "portrait";
        //   pageData.push({
        //     pageNum: i,
        //     rotation: 0,
        //     origRotation,
        //     width,
        //     height,
        //     orientation,
        //   });
        //   console.log("hi", width);
        // }
        newMap[id] = { id: id, publicUrl: url, pdfDoc: pdf, pages: pageData };
      }
      setFileMap(newMap);
      setDefaultFileMap(newMap); // Store the default state
    };
    buildFileMap();
    console.log("finished building file map", fileMap);
  }, [fileIds]);

  // const pagesInitial = fileIds.map((id: string) => ({
  //   id,
  //   page: 0,
  //   rotation: 0,
  //   width: 0,
  //   height: 0,
  //   orientation: "portrait",
  // })
  // const [pages, setPages] = useState([pagesInitial]);
  const [rotation, setRotation] = useState(0);
  const [orientation, setOrientation] = useState<
    "none" | "portrait" | "landscape"
  >("none");

  const [orientationState, setOrientationState] = useState<
    "Not Running" | "Running OCR" | "Done"
  >("Not Running");

  function handleOnReset() {
    setRotation(0);
    setFileMap(defaultFileMap); // Reset to the default state
    setOrientation("none");
    setOrientationState("Not Running");
  }

  function handleOnRotateLeft() {
    setRotation((r) => (r - 90 + 360) % 360);
    setFileMap((prev) => {
      const newMap: FileData = {};
      for (const [id, fileEntry] of Object.entries(prev)) {
        newMap[id] = {
          ...fileEntry,
          pages: fileEntry.pages.map((p) => ({
            ...p,
            orientation:
              p.orientation === "portrait" ? "landscape" : "portrait",
          })),
        };
      }
      return newMap;
    });
  }
  function handleOnRotateRight() {
    setRotation((r) => (r + 90) % 360);
    setFileMap((prev) => {
      const newMap: FileData = {};
      for (const [id, fileEntry] of Object.entries(prev)) {
        newMap[id] = {
          ...fileEntry,
          pages: fileEntry.pages.map((p) => ({
            ...p,
            orientation:
              p.orientation === "portrait" ? "landscape" : "portrait",
          })),
        };
      }
      return newMap;
    });
  }
  function handleOnSetOrientation(mode: "none" | "portrait" | "landscape") {
    setOrientation(mode);
    // setRotation(0);
    setFileMap((prev) => {
      const newMap: FileData = {};
      for (const [id, fileEntry] of Object.entries(prev)) {
        newMap[id] = {
          ...fileEntry,
          pages: fileEntry.pages.map((p) => {
            // Check if the page's orientation is different from the selected mode
            const shouldRotate = mode !== "none" && p.orientation !== mode;
            return {
              ...p,
              rotation: shouldRotate ? (p.rotation + 90) % 360 : p.rotation,
              orientation: shouldRotate ? mode : p.orientation, // Update orientation if rotated
            };
          }),
        };
      }
      return newMap;
    });
  }

  useEffect(() => {
    if (orientation !== "none") {
      setOrientationState("Running OCR");
      handleOnFixOrientation();
    }
  }, [orientation]);

  async function handleOnFixOrientation() {
    const updatedMap: FileData = {};
    console.log("fixing orientation", fileMap);
    for (const [id, fileEntry] of Object.entries(fileMap)) {
      const updatedPages = await Promise.all(
        fileEntry.pages.map(async (page) => {
          const canvas = canvasRefs[`${id}_${page.pageNum}`]; // Assuming multiple canvases per key
          if (!canvas) return page;

          console.log(
            "rotating this page right jnow",
            page.rotation,
            "page num",
            page.pageNum,
            "page orientation:",
            page.orientation
          );
          const result = await detectBestOrientation(
            canvas,
            [0, 180],
            page.rotation
          );

          return {
            ...page,
            rotation: result.bestRotation % 360,
            // orientation: result.bestText.includes("landscape")
            //   ? "landscape"
            //   : "portrait" as "portrait" | "landscape",
          };
        })
      );

      updatedMap[id] = {
        ...fileEntry,
        pages: updatedPages,
      };
    }
    setOrientationState("Done");
    setOrientation("none");
    // setRotation(0);

    setFileMap(updatedMap);
    console.log("Updated fileMap:", updatedMap);
  }

  function rotateSinglePage(id: string, pageNum: number) {
    setFileMap((prev) => {
      return {
        ...prev,
        [id]: {
          ...prev[id],
          pages: prev[id].pages.map((p) => {
            if (p.pageNum === pageNum) {
              return {
                ...p,
                rotation: (p.rotation + 90) % 360,
                orientation:
                  p.orientation === "portrait" ? "landscape" : "portrait",
              };
            }
            return p;
          }),
        },
        // }
        // console.log("rotating single page", id, pageNum);
        // const newMap = { ...prev }; // Shallow clone
        // // const newMap = structuredClone(prev); // Deep clone for safety (optional but safer)
        // const page = newMap[id]?.pages.find((p) => p.pageNum === pageNum);
        // console.log("previous orientation", page?.orientation);
        // if (page) {
        //   page.rotation = (page.rotation + 90) % 360;
        //   page.orientation =
        //     page.orientation === "portrait" ? "landscape" : "portrait";
        // }
        // console.log("new orientation", page?.orientation);

        // return newMap;
      };
    });
  }

  async function downloadPdf(fileEntries: FileEntry[]) {
    for (const fileEntry of fileEntries) {
      const existingPdfBytes = await fetch(fileEntry.publicUrl).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      fileEntry.pages.forEach((pageInfo, index) => {
        pages[index].setRotation(
          degrees(pageInfo.origRotation + pageInfo.rotation + (rotation % 360))
        ); // Apply rotation to each page
        console.log(
          `Setting rotation for page ${index + 1}:`,
          (pageInfo.origRotation + pageInfo.rotation + rotation) % 360
        );
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `rotated-${fileEntry.id}.pdf`;
      link.click();
    }
  }

  async function handleOnMerge(fileEntries: FileEntry[]) {
    const mergedPdfDoc = await PDFDocument.create();

    for (const fileEntry of fileEntries) {
      const existingPdfBytes = await fetch(fileEntry.publicUrl).then((res) =>
        res.arrayBuffer()
      );
      const srcDoc = await PDFDocument.load(existingPdfBytes);
      const pages = srcDoc.getPages();

      fileEntry.pages.forEach((pageInfo, index) => {
        pages[index].setRotation(
          degrees(pageInfo.origRotation + pageInfo.rotation + (rotation % 360))
        ); // Apply rotation to each page
        console.log(
          `Setting rotation for page ${index + 1}:`,
          (pageInfo.origRotation + pageInfo.rotation + rotation) % 360
        );
      });

      const copiedPages = await mergedPdfDoc.copyPages(
        srcDoc,
        srcDoc.getPageIndices()
      );

      // add each copied page into mergedPdfDoc
      copiedPages.forEach((page) => {
        mergedPdfDoc.addPage(page);
      });
    }

    const pdfBytes = await mergedPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rotated-merged.pdf`;
    link.click();
  }

  return (
    <main className="flex-1 grid grid-cols-[1fr_30rem] h-full bg-white text-black overflow-hidden">
      <div className="flex-1 overflow-auto">
        <p className="text-xs text-neutral-500 text-center mt-2">
          {(orientationState === "Running OCR" &&
            "Running OCR on all pages. Please wait...") ||
            (orientationState === "Done" &&
              "All pages are fixed. You can download the PDFs now.")}
        </p>

        {fileIds.map((id: string) => {
          return (
            // Parent Div for each File Preview track
            <div key={id} className="px-6 py-6">
              {/* <p>File ID: {id}</p> */}
              <div key={id} className="flex flex-wrap">
                {fileMap[id]?.pages?.map((pageInfo: PageInfo) => {
                  return (
                    // Child Div for each page in the file
                    <div
                      key={id + pageInfo.pageNum}
                      className="group w-[190px] h-[261px] rounded-lg flex flex-col items-center justify-center p-2 relative onhover:shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all duration-200 ease-in-out"
                      style={{}}
                    >
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 rounded-full bg-white text-gray-700 shadow hover:bg-gray-100 hover:text-black transition-opacity opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          rotateSinglePage(id, pageInfo.pageNum);
                        }}
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <div
                        style={{
                          transform: `rotate(${
                            (rotation + pageInfo.rotation) % 360
                          }deg)`,
                          transformOrigin: "center center",
                        }}
                      >
                        <PDFPageCanvas
                          url={fileMap[id].publicUrl}
                          pageDoc={pageInfo.pageDoc}
                          pageNum={pageInfo.pageNum}
                          scale={0.18}
                          onCanvasReady={(canvas) =>
                            registerCanvas(`${id}_${pageInfo.pageNum}`, canvas)
                          }
                        />
                      </div>
                      {/* <p className="text-xs text-center">
                        Page {pageInfo.pageNum} — {pageInfo.orientation} — rot{" "}
                        {pageInfo.rotation}
                      </p> */}
                    </div>
                  );
                })}

                {/* You can fetch or preview the file using this ID */}
              </div>
            </div>
          );
        })}
        {/* You can fetch or preview the file using this ID */}
      </div>
      <div className="items-center overflow-hidden h-full">
        <PageControls
          orientation={orientation} // ✅ pass current state
          onRotateLeft={handleOnRotateLeft}
          onRotateRight={handleOnRotateRight}
          onReset={handleOnReset}
          onSetOrientation={(mode) => handleOnSetOrientation(mode)} // ✅ update on toggle
          onFixOrientation={handleOnFixOrientation}
          onMerge={() => handleOnMerge(Object.values(fileMap))}
          onDownload={() => downloadPdf(Object.values(fileMap))} // Pass the fileMap to the download function
        />
      </div>
    </main>
  );
}
