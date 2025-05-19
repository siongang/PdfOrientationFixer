import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("PROJECT_URL")!,
    Deno.env.get("SERVICE_KEY")!
  );

  const bucketName = "files; // 🔁 REPLACE THIS with your actual bucket name"
  const { data: files, error } = await supabase.storage.from(bucketName).list("", {
    limit: 1000,
  });

  if (error) {
    return new Response(`Error listing files: ${error.message}`, { status: 500 });
  }

  console.log("Files in bucket:", files);

  
  const now = Date.now();
  const oneHourMs = 60 * 60 * 1000;

  const oldFiles = (files ?? []).filter((file) => {
    const createdAt = new Date(file.created_at).getTime();
    return now - createdAt > oneHourMs;
  });

  const fileNamesToDelete = oldFiles.map((file) => file.name);

  if (fileNamesToDelete.length > 0) {
    await supabase.storage.from(bucketName).remove(fileNamesToDelete);
    return new Response(`Deleted ${fileNamesToDelete.length} files.`);
  } else {
    return new Response("No old files to delete.");
  }
});
