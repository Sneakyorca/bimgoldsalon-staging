"use client";

import { Clock, Info, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { formatGBP } from "@/lib/booking";
import { serviceDeposit, type Service } from "@/lib/services";

/** Short text for a card: the first detail, without its label when it's the main "About" text */
export function previewText(details: Service["details"]): string {
  const first = details[0];
  if (!first) return "";
  const [label, text] = first;
  return label.trim().toLowerCase() === "about" ? text : `${label}: ${text}`;
}

function ServiceDetailsDialog({
  service,
  selected,
  onToggle,
  onClose,
}: {
  service: Service;
  selected?: boolean;
  /** When given, the dialog shows an Add / Remove button */
  onToggle?: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const deposit = serviceDeposit(service.fromPrice, service.depositPercent);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // a click on the dimmed area (outside the white box) closes it
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className="m-0 mt-auto max-h-[88vh] w-full max-w-none overflow-hidden rounded-t-3xl border-0 bg-white p-0 text-black shadow-2xl backdrop:bg-black/50 sm:m-auto sm:max-w-lg sm:rounded-3xl"
    >
      <div className="fade-up flex max-h-[88vh] flex-col">
        <div className="flex items-start gap-3 border-b border-black/10 px-6 pb-4 pt-6">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-500">
              {service.category}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-[24px] font-semibold leading-tight"
            >
              {service.name}
            </h2>
          </div>
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" />
              {service.durationLabel}
            </span>
            <span className="font-bold">
              {service.isFromPrice ? "From " : ""}
              {formatGBP(service.fromPrice)}
            </span>
          </div>
          {deposit > 0 && (
            <p className="mt-2 text-[13px] text-gray-600">
              Deposit to secure it: {formatGBP(deposit)} (
              {service.depositPercent}%). The rest is paid at the salon.
            </p>
          )}

          {service.details.length === 0 ? (
            <p className="mt-5 text-[15px] text-gray-600">
              There are no extra details for this service yet.
            </p>
          ) : (
            <dl className="mt-5 space-y-4">
              {service.details.map(([label, text]) => (
                <div key={label}>
                  {label.trim().toLowerCase() !== "about" && (
                    <dt className="text-[13px] font-semibold uppercase tracking-wide text-gray-500">
                      {label}
                    </dt>
                  )}
                  <dd className="whitespace-pre-line text-[16px] leading-relaxed">
                    {text}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {onToggle && (
          <div className="border-t border-black/10 px-6 py-4">
            <button
              type="button"
              onClick={() => {
                onToggle();
                ref.current?.close();
              }}
              className={`h-12 w-full rounded-full text-[15px] font-semibold ${
                selected
                  ? "border border-primary text-primary hover:bg-card"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {selected ? "Remove from booking" : "Add to booking"}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}

const defaultStyle =
  "inline-flex items-center gap-1.5 rounded-full border border-black/40 px-3 py-1.5 text-[13px] font-semibold hover:bg-card";

/** A button that opens the full details of a service in a modal */
export function ServiceDetailsButton({
  service,
  selected,
  onToggle,
  className = defaultStyle,
  children,
}: {
  service: Service;
  selected?: boolean;
  onToggle?: () => void;
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
        aria-label={`Details for ${service.name}`}
        className={className}
      >
        {children ?? (
          <>
            <Info className="size-4" aria-hidden="true" />
            Details
          </>
        )}
      </button>
      {open && (
        <ServiceDetailsDialog
          service={service}
          selected={selected}
          onToggle={onToggle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
