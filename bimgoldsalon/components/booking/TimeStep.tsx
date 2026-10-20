"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { getAvailabilityAction } from "@/app/booking/actions";
import { useBooking } from "@/context/BookingContext";
import { dayParts, formatTime, type Availability } from "@/lib/booking";
import { Skeleton } from "@/components/ui/Skeleton";
import BookingShell from "./BookingShell";
import BookingSummary from "./BookingSummary";
import WaitlistCard from "./WaitlistCard";

const TimeStep = () => {
  const router = useRouter();
  const { ready, services, duration, date, time, setDate, setSlot } =
    useBooking();
  const stripRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState("");
  const [avail, setAvail] = useState<Availability | null>(null);
  const [availError, setAvailError] = useState("");

  const hasServices = services.length > 0;
  useEffect(() => {
    if (ready && !hasServices) router.replace("/booking");
  }, [ready, hasServices, router]);

  // Ask the server which times are really free for these services
  const serviceKey = services
    .map((s) => s.id)
    .sort()
    .join(",");
  useEffect(() => {
    if (!ready || duration <= 0 || serviceKey === "") return;
    let cancelled = false;
    setAvail(null);
    setAvailError("");
    getAvailabilityAction(serviceKey.split(","))
      .then((a) => {
        if (!cancelled) setAvail(a);
      })
      .catch(() => {
        if (!cancelled)
          setAvailError(
            "We couldn't load available times. Please refresh the page.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [ready, duration, serviceKey]);

  const dates = useMemo(() => avail?.dates ?? [], [avail]);
  // days that still have a slot long enough for the chosen services
  const open = useMemo(
    () => new Set(dates.filter((d) => (avail?.slots[d]?.length ?? 0) > 0)),
    [avail, dates],
  );
  const activeDate =
    date && open.has(date) ? date : (dates.find((d) => open.has(d)) ?? null);
  const slots = useMemo(
    () => (activeDate ? (avail?.slots[activeDate] ?? []) : []),
    [avail, activeDate],
  );
  const selectedTime =
    date === activeDate && time !== null && slots.includes(time) ? time : null;

  if (!ready || !hasServices)
    return <div className="min-h-[50vh]" aria-busy="true" />;

  const pickDate = (iso: string) => {
    setNotice("");
    setDate(iso);
  };

  const fromCalendar = (iso: string) => {
    if (!iso) return;
    if (!open.has(iso)) {
      setNotice(
        "Sorry, there are no free times on that day. Please choose another date.",
      );
      return;
    }
    pickDate(iso);
    document.getElementById(`date-${iso}`)?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  };

  const scrollStrip = (dir: 1 | -1) => {
    const el = stripRef.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const ctrl = "grid size-9 place-items-center rounded-md hover:bg-card";

  return (
    <BookingShell
      step={2}
      title="Select date and time"
      summary={
        <BookingSummary
          onContinue={() => router.push("/booking/confirm")}
          disabled={selectedTime === null}
        />
      }
    >
      {availError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {availError}
        </p>
      ) : !avail ? (
        <div aria-busy="true" aria-label="Loading available times">
          <Skeleton className="h-6 w-36" />
          <div className="mt-3 flex gap-3 overflow-hidden">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-24 w-20 shrink-0 rounded-lg" />
            ))}
          </div>
          <Skeleton className="mt-6 h-6 w-28" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Select a date</h2>
            <div className="flex items-center gap-1">
              {/* the native date input sits invisibly on top, so clicking opens the browser's calendar */}
              <label
                className={`${ctrl} relative cursor-pointer border border-black focus-within:ring-2 focus-within:ring-primary/40`}
              >
                <Calendar className="size-4" />
                <span className="sr-only">Pick a date from the calendar</span>
                <input
                  type="date"
                  min={dates[0]}
                  max={dates[dates.length - 1]}
                  value={activeDate ?? ""}
                  onChange={(e) => fromCalendar(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <button
                type="button"
                onClick={() => scrollStrip(-1)}
                aria-label="Earlier dates"
                className={ctrl}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollStrip(1)}
                aria-label="Later dates"
                className={ctrl}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>

          <div
            ref={stripRef}
            className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0"
          >
            {dates.map((d) => {
              const p = dayParts(d);
              const on = d === activeDate;
              const isOpen = open.has(d);
              return (
                <button
                  key={d}
                  id={`date-${d}`}
                  type="button"
                  disabled={!isOpen}
                  aria-pressed={on}
                  title={isOpen ? undefined : "No availability"}
                  onClick={() => pickDate(d)}
                  className={`w-20 shrink-0 rounded-lg border p-2 text-center transition ${
                    on
                      ? "border-primary bg-primary text-white"
                      : "border-black bg-white enabled:hover:bg-card"
                  } ${isOpen ? "" : "cursor-not-allowed border-gray-300 text-gray-400"}`}
                >
                  <span className="block text-[14px] font-medium">
                    {p.weekday}
                  </span>
                  <span className="block text-[28px] font-bold leading-none">
                    {p.day}
                  </span>
                  <span className="block text-[14px] font-medium">
                    {p.month}
                  </span>
                </button>
              );
            })}
          </div>
          {notice && (
            <p role="alert" className="mt-2 text-[14px] text-red-600">
              {notice}
            </p>
          )}

          <h2 className="mt-6 text-[18px] font-semibold">Pick a time</h2>
          {open.size === 0 ? (
            <div
              role="alert"
              className="mt-3 rounded-lg bg-red-50 p-4 text-[15px] text-red-700"
            >
              There are no free times for the services you&apos;ve chosen in the
              next few weeks. Try fewer services, or contact the salon.{" "}
              <Link href="/booking" className="font-semibold underline">
                Change services
              </Link>
            </div>
          ) : slots.length === 0 ? (
            <p className="mt-3 text-gray-600">
              No times available. Please choose another date.
            </p>
          ) : (
            <ul
              key={activeDate}
              className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            >
              {slots.map((t, i) => (
                <li
                  key={t}
                  className="fade-up"
                  style={{ "--i": Math.min(i, 10) } as CSSProperties}
                >
                  <button
                    type="button"
                    aria-pressed={selectedTime === t}
                    onClick={() => activeDate && setSlot(activeDate, t)}
                    className={`h-12 w-full rounded-lg px-4 text-left text-[16px] font-semibold ${
                      selectedTime === t
                        ? "border-2 border-primary bg-card"
                        : "border border-black bg-white hover:bg-card"
                    }`}
                  >
                    {formatTime(t)}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <WaitlistCard
            serviceIds={services.map((s) => s.id)}
            min={dates[1] ?? dates[0]}
            max={dates[dates.length - 1]}
          />
        </>
      )}
    </BookingShell>
  );
};

export default TimeStep;
