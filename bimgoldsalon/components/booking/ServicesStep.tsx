"use client";

import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useBooking } from "@/context/BookingContext";
import { formatDuration, formatGBP } from "@/lib/booking";
import type { Service } from "@/lib/services";
import BookingShell from "./BookingShell";
import BookingSummary from "./BookingSummary";
import { previewText, ServiceDetailsButton } from "./ServiceInfo";
import BookingWelcome from "./BookingWelcome";
import PolicyDialogButton from "./PolicyDialog";
import ServiceThumb from "./ServiceThumb";

const searchText = (s: Service) =>
  [s.name, s.category, ...s.details.map(([, text]) => text)]
    .join(" ")
    .toLowerCase();
const imageOf = (s: Service): string => {
  const x = s as Service & { image?: string; images?: string[] };
  return x.image || x.images?.[0] || "";
};
const ServiceCard = ({
  s,
  on,
  onToggle,
}: {
  s: Service;
  on: boolean;
  onToggle: () => void;
}) => (
  <li
    className={`flex flex-col rounded-2xl border bg-[#f9f9f9] p-5 transition-shadow duration-200 hover:shadow-md ${
      on ? "border-2 border-primary" : "border-black/60"
    }`}
  >
    <h3 className="text-[22px] font-semibold leading-tight md:text-[24px]">
      {s.name}
    </h3>
    <p className="mt-1 text-[14px] text-gray-500">{s.durationLabel}</p>
    {s.details.length > 0 && (
      <p className="mt-3 line-clamp-2 text-[15px] leading-snug text-gray-700">
        {previewText(s.details)}
      </p>
    )}
    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
      <span className="text-[15px] font-bold">
        {s.isFromPrice ? "From " : ""}
        {formatGBP(s.fromPrice)}
      </span>
      <div className="flex items-center gap-3">
        {s.details.length > 0 && (
          <ServiceDetailsButton service={s} selected={on} onToggle={onToggle} />
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={on}
          aria-label={on ? `Remove ${s.name}` : `Add ${s.name}`}
          className={`grid size-8 place-items-center rounded-full border-2 border-black ${
            on ? "bg-primary text-white" : "bg-transparent"
          }`}
        >
          {on ? (
            <Check className="size-5" strokeWidth={3} />
          ) : (
            <Plus className="size-5" />
          )}
        </button>
      </div>
    </div>
  </li>
);

const ServicesStep = () => {
  const router = useRouter();
  const {
    ready,
    loadError,
    catalog,
    services: selected,
    price,
    duration,
    toggleService,
  } = useBooking();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const baseId = useId();
  const seen = useRef<Set<string>>(new Set());

  // Open the section of anything newly selected (including from the homepage)
  useEffect(() => {
    const fresh = selected.filter((s) => !seen.current.has(s.id));
    if (fresh.length === 0) return;
    fresh.forEach((s) => seen.current.add(s.id));
    setOpen((prev) => new Set([...prev, ...fresh.map((s) => s.category)]));
  }, [selected]);

  const selectedIds = useMemo(
    () => new Set(selected.map((s) => s.id)),
    [selected],
  );
  const selectedByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of selected)
      map.set(s.category, (map.get(s.category) ?? 0) + 1);
    return map;
  }, [selected]);

  const categories = useMemo(
    () => [...new Set(catalog.map((s) => s.category))],
    [catalog],
  ); // the first service in each group that has a photo becomes the group's picture
  const coverByCategory = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of catalog) {
      const img = imageOf(s);
      if (img && !map.has(s.category)) map.set(s.category, img);
    }
    return map;
  }, [catalog]);
  const index = useMemo(
    () => new Map(catalog.map((s) => [s.id, searchText(s)])),
    [catalog],
  );

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;

  const groups = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of catalog) {
      const hay = index.get(s.id) ?? "";
      if (terms.length && !terms.every((t) => hay.includes(t))) continue;
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return [...map];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, index, query]);

  const matchCount = groups.reduce((n, [, list]) => n + list.length, 0);

  const toggleCategory = (category: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(category)) next.add(category);
      return next;
    });

  return (
    <BookingShell
      step={1}
      title="Select Services"
      summary={
        <BookingSummary
          onContinue={() => router.push("/booking/time")}
          disabled={selected.length === 0}
        />
      }
    >
      <BookingWelcome />
      {loadError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {loadError}
        </p>
      ) : !ready ? (
        <div aria-busy="true" aria-label="Loading services">
          <Skeleton className="h-12 w-full rounded-full" />
          <div className="mt-5 space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      ) : catalog.length === 0 ? (
        <p className="text-gray-600">
          Online booking isn&apos;t available right now. Please contact the
          salon.
        </p>
      ) : (
        <>
          {/* Search stays in view while you scroll */}
          <div className="sticky top-20 z-20 -mx-5 bg-white/95 px-5 pb-2 pt-2 backdrop-blur md:top-24 md:mx-0 md:px-0 lg:top-28">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-gray-600" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && query) setQuery("");
                }}
                placeholder="Search services, e.g. knotless, cornrow, wig"
                aria-label="Search services"
                className="h-12 w-full rounded-full border border-black/60 bg-white pl-13 pr-12 text-[16px] outline-none focus:ring-2 focus:ring-primary/30 [&::-webkit-search-cancel-button]:appearance-none"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-gray-600 hover:bg-black/5"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[13px] text-gray-600">
              <span aria-live="polite">
                {searching
                  ? `${matchCount} service${matchCount === 1 ? "" : "s"} found`
                  : `${catalog.length} services in ${categories.length} categories`}
              </span>
              <span className="flex gap-4">
                <PolicyDialogButton className="font-semibold text-primary underline-offset-2 hover:underline">
                  Booking policy
                </PolicyDialogButton>
                {!searching && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpen(new Set(categories))}
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      Expand all
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(new Set())}
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      Collapse all
                    </button>
                  </>
                )}
              </span>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-600">
                No services match &ldquo;{query.trim()}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 rounded-full border border-primary px-6 py-2 text-[14px] font-semibold text-primary hover:bg-card"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {groups.map(([category, list], gi) => {
                const isOpen = searching || open.has(category);
                const panelId = `${baseId}-${gi}`;
                const count = selectedByCategory.get(category) ?? 0;
                return (
                  <section
                    key={category}
                    className="rounded-2xl border border-black/20 bg-white"
                  >
                    <h2>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => !searching && toggleCategory(category)}
                        className="flex w-full items-center gap-3 px-5 py-4 text-left"
                      >
                        {coverByCategory.get(category) && (
                          <ServiceThumb
                            image={coverByCategory.get(category)}
                            className="size-12"
                          />
                        )}
                        <span className="min-w-0 flex-1 text-[18px] font-semibold leading-tight">
                          {category}
                        </span>
                        {count > 0 && (
                          <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[12px] font-semibold text-white">
                            {count} selected
                          </span>
                        )}
                        <span className="shrink-0 text-[13px] text-gray-500">
                          {list.length}
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className={`size-5 shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          } ${searching ? "opacity-30" : ""}`}
                        />
                      </button>
                    </h2>
                    <div
                      id={panelId}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden" inert={!isOpen}>
                        <ul className="grid gap-4 px-4 pb-5 pt-1 md:grid-cols-2 lg:grid-cols-1">
                          {list.map((s) => (
                            <ServiceCard
                              key={s.id}
                              s={s}
                              on={selectedIds.has(s.id)}
                              onToggle={() => toggleService(s.id)}
                            />
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Phones: a Continue bar that sticks to the bottom once you've chosen something */}
          {selected.length > 0 && (
            <div className="sticky bottom-0 z-20 -mx-5 mt-6 flex items-center justify-between gap-3 border-t border-black/10 bg-white px-5 py-3 shadow-[0_-6px_16px_-10px_rgba(0,0,0,0.3)] lg:hidden">
              <div className="min-w-0 text-[14px] leading-tight">
                <p className="font-semibold">
                  {selected.length} selected · {formatGBP(price)}
                </p>
                <p className="text-gray-600">{formatDuration(duration)}</p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/booking/time")}
                className="shrink-0 rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-white"
              >
                Continue
              </button>
            </div>
          )}
        </>
      )}
    </BookingShell>
  );
};

export default ServicesStep;
