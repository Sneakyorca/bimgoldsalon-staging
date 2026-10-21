"use client";

import { Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type CSSProperties } from "react";
import { useBooking } from "@/context/BookingContext";
import { formatGBP } from "@/lib/booking";
import { Skeleton } from "@/components/ui/Skeleton";
import BookingShell from "./BookingShell";
import BookingSummary from "./BookingSummary";
import ServiceThumb from "./ServiceThumb";

const ServicesStep = () => {
  const router = useRouter();
  const {
    ready,
    loadError,
    catalog,
    services: selected,
    toggleService,
  } = useBooking();
  const [tab, setTab] = useState("All");

  const tabs = useMemo(
    () => ["All", ...new Set(catalog.map((s) => s.category))],
    [catalog],
  );
  const list = useMemo(
    () => (tab === "All" ? catalog : catalog.filter((s) => s.category === tab)),
    [catalog, tab],
  );
  const selectedIds = new Set(selected.map((s) => s.id));

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
      {loadError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {loadError}
        </p>
      ) : !ready ? (
        <div aria-busy="true" aria-label="Loading services">
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
          </div>
          <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-1">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="rounded-2xl border border-black/10 bg-[#f9f9f9] p-5"
              >
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="mt-3 h-4 w-1/4" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-6 h-6 w-1/3" />
              </li>
            ))}
          </ul>
        </div>
      ) : catalog.length === 0 ? (
        <p className="text-gray-600">
          Online booking isn&apos;t available right now. Please contact the
          salon.
        </p>
      ) : (
        <>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-full border px-5 py-2 text-[15px] font-medium ${
                  tab === t
                    ? "border-primary bg-primary text-white"
                    : "border-black/60 hover:bg-card"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <h2 className="mt-6 text-[18px] font-semibold">{tab}</h2>

          <ul
            key={tab}
            className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-1"
          >
            {list.map((s, i) => {
              const on = selectedIds.has(s.id);
              return (
                <li
                  key={s.id}
                  style={{ "--i": Math.min(i, 8) } as CSSProperties}
                  className={`fade-up flex flex-col rounded-2xl border bg-[#f9f9f9] p-5 transition-shadow duration-200 hover:shadow-md ${on ? "border-2 border-primary" : "border-black/60"}`}
                >
                  <div className="flex items-start gap-4">
                    <ServiceThumb image={s.image} />
                    <div className="min-w-0">
                      <h3 className="text-[26px] font-semibold leading-tight">
                        {s.name}
                      </h3>
                      <p className="mt-1 text-[14px] text-gray-500">
                        {s.durationLabel}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-[16px] leading-snug">
                    {s.details.map(([label, text]) => (
                      <p key={label} className="line-clamp-4">
                        <span className="font-semibold">{label}</span>: {text}
                      </p>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <span className="text-[15px] font-bold">
                      From {formatGBP(s.fromPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleService(s.id)}
                      aria-pressed={on}
                      aria-label={on ? `Remove ${s.name}` : `Add ${s.name}`}
                      className={`grid size-8 place-items-center rounded-full border-2 border-black transition active:scale-90 ${
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
                </li>
              );
            })}
          </ul>
        </>
      )}
    </BookingShell>
  );
};

export default ServicesStep;
