"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { policy } from "@/lib/salon";
import { PolicyBody } from "./PolicyContent";

function PolicyDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className="m-0 mt-auto max-h-[88vh] w-full max-w-none overflow-hidden rounded-t-3xl border-0 bg-white p-0 text-black shadow-2xl backdrop:bg-black/50 sm:m-auto sm:max-w-lg sm:rounded-3xl"
    >
      <div className="fade-up flex max-h-[88vh] flex-col">
        <div className="flex items-start gap-3 border-b border-black/10 px-6 pb-4 pt-6">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-[24px] font-semibold leading-tight"
          >
            Booking policy
          </h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-black/30 hover:bg-black hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          <p className="rounded-xl bg-card px-4 py-3 text-[15px] font-medium">
            {policy.cancellation}
          </p>
          <div className="mt-5">
            <PolicyBody showHeading={false} />
          </div>
        </div>
        <div className="border-t border-black/10 px-6 py-4">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="h-12 w-full rounded-full bg-primary text-[15px] font-semibold text-white hover:opacity-90"
          >
            Got it
          </button>
        </div>
      </div>
    </dialog>
  );
}

/** A button that opens the booking policy in a pop-up */
export default function PolicyDialogButton({
  className = "font-semibold text-primary underline-offset-2 hover:underline",
  children = "Booking policy",
}: {
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={className}
      >
        {children}
      </button>
      {open && <PolicyDialog onClose={() => setOpen(false)} />}
    </>
  );
}
