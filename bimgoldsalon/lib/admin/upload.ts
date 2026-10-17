import { createClient } from "@/lib/supabase/client";
import { CATALOG_BUCKET } from "@/lib/products";

const MAX_SIDE = 1600;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Shrinks the photo in the browser first, so uploads stay small and fast
async function toJpegBlob(file: File): Promise<Blob> {
  if (!TYPES.includes(file.type))
    throw new Error("Choose a PNG, JPG or WebP image.");
  if (file.size > 12 * 1024 * 1024)
    throw new Error("That image is over 12 MB.");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't read that image.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Couldn't process that image.")),
      "image/jpeg",
      0.85,
    ),
  );
}

/** Uploads to the catalog bucket and returns the public URL. Admin only (storage RLS). */
export async function uploadCatalogImage(
  file: File,
  folder: string,
): Promise<string> {
  const blob = await toJpegBlob(file);
  const supabase = createClient();
  const path = `${folder}/${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from(CATALOG_BUCKET)
    .upload(path, blob, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
    });
  if (error)
    throw new Error("Upload failed. Make sure you're signed in as an admin.");

  return supabase.storage.from(CATALOG_BUCKET).getPublicUrl(path).data
    .publicUrl;
}
