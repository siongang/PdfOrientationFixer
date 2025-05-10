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
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-8">File Orientation Fixer</h1>
      <button
        onClick={() => inputRef.current?.click()}
        className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition"
      >
        Upload Files
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
