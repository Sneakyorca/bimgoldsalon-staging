/* eslint-disable @next/next/no-img-element */
export default function ImageThumbnails({
  images,
  onRemove,
}: {
  images: string[];
  onRemove?: (src: string) => void;
}) {
  if (!images.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {images.map((src) => (
        <div key={src} className="relative">
          <img src={src} alt="" className="size-16 rounded object-cover" />
          {onRemove && (
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onRemove(src)}
              className="absolute -right-1 -top-1 size-5 rounded-full bg-black text-white"
            >
              x
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
