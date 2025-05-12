"use client";

import { RotateCcw, RotateCw } from "lucide-react";

type OrientationMode = "none" | "portrait" | "landscape";
type OrientationState = "Not Running"| "Running OCR" | "Done";

type Props = {
  rotation: number;
  orientation: OrientationMode;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onReset: () => void;
  onSetOrientation: (mode: OrientationMode) => void;
  onFixOrientation: () => void;
  onMerge: () => void;
  onDownload: () => void;
  orientationState: OrientationState
};

export default function PageControls({
  rotation,
  orientation,
  onRotateLeft,
  onRotateRight,
  onReset,
  onSetOrientation,
  onMerge,
  onDownload,
  orientationState,
}: Props) {
  const orientationButtons: { label: string; value: OrientationMode }[] = [
    { label: "None", value: "none" },
    { label: "Portrait", value: "portrait" },
    { label: "Landscape", value: "landscape" },
  ];

  return (
    <div className="flex flex-col justify-center items-center w-full h-full p-6 border-l border-neutral-200 bg-neutral-100 text-black space-y-6">
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 p-4">
        <p>
          Hover over a page to show the rotate button.
          <br />
          To fix all page orientations, choose an option below.
          <br />
          Pages are first rotated by size, then fine-tuned using OCR.
          <br />
          <span className="text-red-600 font-semibold">Note:</span> OCR may take
          longer on large files — improvements coming soon!
        </p>
      </div>

      {/* Card-style Top Controls */}
      <div className="w-3/4 bg-white rounded-xl shadow-sm p-4 space-y-4">
        {/* Reset */}
        <button
          onClick={onReset}
          className="bg-neutral-100 hover:bg-neutral-200 text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
        >
          Reset
        </button>

        {/* Rotate */}
        <div>
          <label className="text-sm font-medium block mb-1">
            Rotate All Files
          </label>
          <div className="flex gap-3">
            <button
              onClick={onRotateLeft}
              className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full transition shadow-sm"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onRotateRight}
              className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full transition shadow-sm"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Orientation */}
        <div>
          <label className="text-sm font-medium block mb-1">Orientation</label>
          <div className="flex gap-2 flex-wrap">
            {orientationButtons.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => onSetOrientation(value)}
                className={`px-3 py-1 text-sm rounded-lg transition shadow-sm ${
                  orientation === value
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 text-black hover:bg-neutral-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Merge Button */}
        <button
          onClick={onMerge}
          className="px-4 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg shadow-sm transition"
        >
          Merge PDFs
        </button>
      </div>

      {/* Bottom Download Section */}
      <div className="w-3/4 bg-white rounded-xl shadow-sm p-4">
        <button
          onClick={onDownload}
          className="w-full px-6 py-3 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition text-sm shadow-md"
        >
          Download PDFs
        </button>

      </div>
    </div>
  );
}
