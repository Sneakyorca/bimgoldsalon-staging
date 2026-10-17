"use client";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { MAX_GALLERY_IMAGES } from "@/lib/admin/constants";
import { uploadCatalogImage } from "@/lib/admin/upload";
import { iconBtn, labelCls } from "./ui";

export default function ImageField({
  image,
  images,
  onImage,
  onImages,
  folder = "misc",
  onBusyChange,
}: {
  image: string;
  images: string[];
  onImage: (value: string) => void;
  onImages: (values: string[]) => void;
  /** Storage folder, e.g. "products" */
  folder?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    onBusyChange?.(true);
    setError("");
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That image did not work.");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <span className={labelCls}>Main photo</span>
        <div className="mt-2 flex items-center gap-3">
          {image ? (
            <img
              src={image}
              alt="Main preview"
              className="size-20 rounded-lg object-cover"
            />
          ) : (
            <div className="grid size-20 place-items-center rounded-lg border border-dashed">
              None
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2">
            <ImagePlus className="size-4" />
            {busy ? "Uploading…" : "Choose photo"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file)
                  void run(async () =>
                    onImage(await uploadCatalogImage(file, folder)),
                  );
              }}
            />
          </label>
          {image && (
            <button
              type="button"
              onClick={() => onImage("")}
              className="text-sm underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div>
        <span className={labelCls}>
          More photos ({images.length}/{MAX_GALLERY_IMAGES})
        </span>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((src, index) => (
            <div key={`${index}-${src}`} className="relative">
              <img
                src={src}
                alt={`Photo ${index + 1}`}
                className="size-20 rounded-lg object-cover"
              />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() =>
                  onImages(images.filter((_, item) => item !== index))
                }
                className={`${iconBtn} absolute -right-2 -top-2 !size-8 !rounded-full !bg-black !text-white`}
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        {images.length < MAX_GALLERY_IMAGES && (
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2">
            <ImagePlus className="size-4" />
            {busy ? "Uploading…" : "Add photos"}
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).slice(
                  0,
                  MAX_GALLERY_IMAGES - images.length,
                );
                e.target.value = "";
                if (files.length)
                  void run(async () =>
                    onImages([
                      ...images,
                      ...(await Promise.all(
                        files.map((f) => uploadCatalogImage(f, folder)),
                      )),
                    ]),
                  );
              }}
            />
          </label>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
