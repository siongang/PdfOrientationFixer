import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const savedFileNames: string[] = [];

    console.log("Files received:", files);

    for (const file of files) {
      if (typeof file === "string") continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-z0-9_.-]/gi, "_");
      const fileName = `${timestamp}-${safeName}`;
      const tmpDir = os.tmpdir();
      const filePath = path.join(tmpDir, fileName);
      console.log("Saving file to:", filePath);
      await writeFile(filePath, buffer);
      savedFileNames.push(fileName);
    }

    return NextResponse.json({ ids: savedFileNames });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
