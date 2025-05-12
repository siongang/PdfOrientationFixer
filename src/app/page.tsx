"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const ids: string[] = [];
    for (const file of files) {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-z0-9_.-]/gi, "_");
      const fileName = `${timestamp}-${safeName}`;

      const { error } = await supabase.storage
        .from("files")
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      ids.push(fileName);
    }

    if (ids.length > 0) {
      router.push(`/process?ids=${encodeURIComponent(JSON.stringify(ids))}`);
    }
  };
return (
  <main className="w-full flex flex-col items-center min-h-screen px-6 py-16 items-center text-black gap-8 text-center">
    <p className="max-w-2xl text-lg items-center leading-relaxed">
      Ever had lecture notes or documents with randomly rotated pages?
      Instead of rotating your head to read, use <strong>PDF Orientation Fixer</strong> to auto-rotate pages using OCR, manually adjust/rotate them, merge files, and download the results.
      <br />
      Upload speed may be slow for large files, but we&apos;re working on it!
    </p>

    <button
      onClick={() => inputRef.current?.click()}
      className="bg-red-600 text-white w-60 text-lg font-semibold px-8 py-4 rounded-lg hover:bg-red-700 transition"
    >
      Select PDF Files
    </button>

    <input
      type="file"
      accept=".pdf,image/*"
      ref={inputRef}
      onChange={handleFileChange}
      multiple
      className="hidden"
    />
  </main>
);

}
