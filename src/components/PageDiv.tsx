import { useState } from "react";
import PDFPageCanvas from "@/components/PDFPageCanvas";
import { RotateCw } from "lucide-react";

interface Props {
  id: string;
  pageInfo: {
    pageNum: number;
    rotation: number;
    orientation: "portrait" | "landscape";
  };
  publicUrl: string;
  globalRotation: number;
  onCanvasReady: (id: string, canvas: HTMLCanvasElement) => void;
}

export default function PageDiv({
  id,
  pageInfo,
  publicUrl,
  globalRotation,
  onCanvasReady,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const { pageNum, rotation } = pageInfo;

  return (
    <div
      key={id + pageNum}
      className="w-[160px] h-[220px] flex flex-col items-center justify-center p-2 relative hover:shadow-xl hover:bg-gray-100 transition-all duration-200 ease-in-out"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <button className="absolute top-1  text-black text-xs px-2 py-1 transition duration-400">
          <RotateCw className="w-4 h-4" />
        </button>
      )}
    <div className="w-full h-full overflow-hidden flex items-center justify-center">
      <div
        style={{
          transform: `rotate(${(globalRotation + rotation) % 360}deg)`,
          transformOrigin: "center center",
        }}
        className="max-w-full max-h-full "
      >
        <PDFPageCanvas
          url={publicUrl}
          pageNum={pageNum}
          scale={0.18}
          onCanvasReady={(canvas) =>
            onCanvasReady(`${id}_${pageNum}`, canvas)
          }
        />
      </div>
    </div>
    </div>
  );
}
