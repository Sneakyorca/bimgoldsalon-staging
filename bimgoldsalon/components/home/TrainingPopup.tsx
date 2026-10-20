"use client";

import { Megaphone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Lives in module memory: resets on a full page load/reload,
// but survives client-side navigation (e.g. Home -> Training -> Home).
let hasShown = false;

const TrainingPopup = () => {
  const [open, setOpen] = useState(false);

  // Open once per fresh load
  useEffect(() => {
    if (hasShown) return;
    hasShown = true;
    setOpen(true);
  }, []);

  // Escape to close + lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const close = () => setOpen(false);

  return (
    <div
      className="overlay-in fixed inset-0 z-50 grid place-items-center bg-black/50 p-5"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="training-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="dialog-in relative w-full max-w-md rounded-2xl bg-white px-6 pb-8 pt-12 text-center shadow-xl md:px-10"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full transition hover:bg-black/5"
        >
          <X className="size-6" strokeWidth={1.5} />
        </button>

        <div className="mx-auto grid size-24 place-items-center rounded-full bg-primary text-white">
          <Megaphone className="size-10" />
        </div>

        <h2
          id="training-popup-title"
          className="mt-6 text-[24px] font-semibold leading-tight md:text-[28px]"
        >
          Exciting Opportunities!
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed md:text-[18px]">
          Join our upcoming training sessions or explore our latest job
          vacancies to take the next step in your career.
        </p>

        <Link
          href="/training"
          onClick={close}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-[16px] font-semibold text-white transition hover:opacity-90"
        >
          Explore Now
        </Link>

        <button
          type="button"
          onClick={close}
          className="mt-5 text-[16px] font-semibold text-neutral-900 hover:underline"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export default TrainingPopup;
