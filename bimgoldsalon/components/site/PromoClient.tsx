"use client";

import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

export type PromoView = {
  style: "popup" | "banner";
  title: string;
  message: string;
  buttonLabel: string;
  buttonUrl: string;
  startsAt: string | null;
  endsAt: string | null;
  repeatHours: number;
  version: string;
};

// Never interrupt sign-in, payment or the admin
const QUIET = [
  "/admin",
  "/auth",
  "/forgot-password",
  "/checkout",
  "/payment",
  "/profile",
];
// A pop-up also stays away while someone is booking or in the basket
const POPUP_QUIET = ["/booking", "/cart"];
const onPath = (path: string, list: string[]) =>
  list.some((p) => path === p || path.startsWith(`${p}/`));

// repeatHours 0 = hidden only for this visit (tab session)
function wasClosed(key: string, repeatHours: number) {
  try {
    const raw = (repeatHours > 0 ? localStorage : sessionStorage).getItem(key);
    if (!raw) return false;
    if (repeatHours === 0) return true;
    return Date.now() - Number(raw) < repeatHours * 3_600_000;
  } catch {
    return false;
  }
}
function remember(key: string, repeatHours: number) {
  try {
    (repeatHours > 0 ? localStorage : sessionStorage).setItem(
      key,
      String(Date.now()),
    );
  } catch {
    // ignore storage errors
  }
}

function PromoLink({
  url,
  className,
  onClick,
  children,
}: {
  url: string;
  className: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (/^https:\/\//.test(url))
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={className}
      >
        {children}
      </a>
    );
  return (
    <Link href={url} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

type CardProps = {
  promo: Pick<PromoView, "title" | "message" | "buttonLabel" | "buttonUrl">;
  onClose: () => void;
  /** admin preview: no dialog role, no autofocus */
  preview?: boolean;
};

export function PromoPopupCard({ promo, onClose, preview }: CardProps) {
  const hasButton = promo.buttonLabel !== "" && promo.buttonUrl !== "";
  return (
    <div
      role={preview ? undefined : "dialog"}
      aria-modal={preview ? undefined : true}
      aria-labelledby={promo.title ? "promo-popup-title" : undefined}
      onClick={(e) => e.stopPropagation()}
      className="dialog-in relative w-full max-w-md rounded-2xl bg-white px-6 pb-8 pt-12 text-center shadow-xl md:px-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        autoFocus={!preview}
        className="absolute right-4 top-4 grid size-8 place-items-center rounded-full transition hover:bg-black/5"
      >
        <X className="size-6" strokeWidth={1.5} />
      </button>
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-white">
        <Sparkles className="size-9" />
      </div>
      {promo.title && (
        <h2
          id="promo-popup-title"
          className="mt-6 text-[24px] font-semibold leading-tight md:text-[28px]"
        >
          {promo.title}
        </h2>
      )}
      {promo.message && (
        <p className="mt-4 whitespace-pre-line text-[16px] leading-relaxed text-neutral-700 md:text-[18px]">
          {promo.message}
        </p>
      )}
      {hasButton && (
        <PromoLink
          url={promo.buttonUrl}
          onClick={onClose}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-[16px] font-semibold text-white transition hover:opacity-90"
        >
          {promo.buttonLabel}
        </PromoLink>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-5 text-[16px] font-semibold text-neutral-900 hover:underline"
      >
        No thanks
      </button>
    </div>
  );
}

export function PromoBannerBar({ promo, onClose, preview }: CardProps) {
  const hasButton = promo.buttonLabel !== "" && promo.buttonUrl !== "";
  return (
    <div
      role={preview ? undefined : "region"}
      aria-label="Announcement"
      className="relative bg-primary px-12 py-2.5 text-center text-[14px] leading-snug text-white"
    >
      <p className="mx-auto max-w-4xl">
        {promo.title && (
          <strong className="font-semibold">{promo.title} </strong>
        )}
        {promo.message}
        {hasButton && (
          <PromoLink
            url={promo.buttonUrl}
            onClick={onClose}
            className="ml-2 whitespace-nowrap font-semibold underline underline-offset-2 hover:no-underline"
          >
            {promo.buttonLabel}
          </PromoLink>
        )}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close announcement"
        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full transition hover:bg-white/15"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}

export default function PromoClient({ promo }: { promo: PromoView }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const key = `bimgold_promo_${promo.version}`;
  const quiet =
    onPath(pathname, QUIET) ||
    (promo.style === "popup" && onPath(pathname, POPUP_QUIET));

  const close = useCallback(() => {
    remember(key, promo.repeatHours);
    setOpen(false);
  }, [key, promo.repeatHours]);

  useEffect(() => {
    if (quiet) {
      setOpen(false);
      return;
    }
    const now = Date.now();
    const start = promo.startsAt ? Date.parse(promo.startsAt) : 0;
    const end = promo.endsAt ? Date.parse(promo.endsAt) : Infinity;
    if (now < start || now >= end || wasClosed(key, promo.repeatHours)) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let poll: ReturnType<typeof setInterval> | undefined;

    if (promo.style === "banner") {
      setOpen(true);
    } else {
      // wait a moment, and until no other pop-up (like the training one) is open
      timers.push(
        setTimeout(() => {
          let tries = 0;
          poll = setInterval(() => {
            tries += 1;
            const busy = document.querySelector(
              '[aria-modal="true"], dialog[open]',
            );
            if (!busy) {
              clearInterval(poll);
              setOpen(true);
            } else if (tries > 150) {
              clearInterval(poll);
            }
          }, 800);
        }, 1500),
      );
    }

    const left = end - now; // take it down when its time is up
    if (Number.isFinite(left) && left < 2_147_000_000)
      timers.push(setTimeout(() => setOpen(false), left));

    return () => {
      timers.forEach(clearTimeout);
      if (poll) clearInterval(poll);
    };
  }, [
    quiet,
    key,
    promo.style,
    promo.startsAt,
    promo.endsAt,
    promo.repeatHours,
  ]);

  useEffect(() => {
    if (!open || promo.style !== "popup") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, promo.style, close]);

  if (!open || quiet) return null;

  if (promo.style === "banner")
    return (
      <div className="fixed inset-x-0 top-20 z-30 shadow-md md:top-24 lg:top-28">
        <PromoBannerBar promo={promo} onClose={close} />
      </div>
    );

  return (
    <div
      className="overlay-in fixed inset-0 z-50 grid place-items-center bg-black/50 p-5"
      onClick={close}
    >
      <PromoPopupCard promo={promo} onClose={close} />
    </div>
  );
}
