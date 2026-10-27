"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChooseOptionsButton({
  productId,
  className = "",
}: {
  productId: number;
  className?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={(e) => {
        // the card itself is a link, so stop that and go to the options
        e.preventDefault();
        e.stopPropagation();
        router.push(`/product/${productId}`);
      }}
      className={`relative z-10 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-[12px] font-semibold text-white hover:opacity-90 ${className}`}
    >
      <SlidersHorizontal className="size-3.5" aria-hidden="true" />
      Choose options
    </button>
  );
}
