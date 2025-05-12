import Tesseract from "tesseract.js";

/**
 * Detects best orientation of an image/canvas by comparing OCR text length.
 * @param {HTMLCanvasElement | HTMLImageElement} input
 * @returns {Promise<{ bestRotation: number, bestText: string }>}
 */
export async function detectBestOrientation(
  input: HTMLCanvasElement | HTMLImageElement,
  candidateOffsets: number[] = [0, 180],
  baseRotation: number
): Promise<{ bestRotation: number; bestText: string }> {
  console.log(
    "Detecting best orientation (in parallel)...",
    candidateOffsets,
    "base rotation",
    baseRotation
  );

  const results = await Promise.all(
    candidateOffsets.map(async (offset) => {
      const angle = (baseRotation + offset) % 360;
      const rotated = rotateCanvas(input, angle);
      const { data } = await Tesseract.recognize(rotated, "eng");
        console.log("THE TWO ANGLES", angle)
      return {
        angle: angle,
        text: data.text,
        length: data.text?.length || 0,
      };
    })
  );

  // Choose the angle with the most extracted text
  const best = results.reduce((a, b) => (a.length > b.length ? a : b));
  console.log("Best orientation:", best.angle, "with text :", best.text);
  return {
    bestRotation: best.angle,
    bestText: best.text,
  };
}

// 🔁 Rotate canvas helper (non-destructive)
function rotateCanvas(
  input: HTMLCanvasElement | HTMLImageElement,
  degrees: number
) {
  const radians = (degrees * Math.PI) / 180;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context not available");
  }
  if (degrees % 180 === 0) {
    canvas.width = input.width;
    canvas.height = input.height;
  } else {
    canvas.width = input.height;
    canvas.height = input.width;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(input, -input.width / 2, -input.height / 2);

  return canvas;
}
