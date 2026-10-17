"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBooking } from "@/context/BookingContext";
import {
  formatDuration,
  formatGBP,
  formatLongDate,
  formatRange,
  servicesByIds,
} from "@/lib/booking";
import BookingShell from "./BookingShell";

const ConfirmedStep = () => {
  const router = useRouter();
  const { ready, catalog, confirmed, clearDraft, reset } = useBooking();

  useEffect(() => {
    if (!ready) return;
    if (!confirmed) router.replace("/booking");
    else clearDraft(); // booking is done, so "back" can't re-submit it
  }, [ready, confirmed, clearDraft, router]);

  if (!ready || !confirmed)
    return <div className="min-h-[50vh]" aria-busy="true" />;

  const list = servicesByIds(catalog, confirmed.serviceIds);

  return (
    <BookingShell step={3} title="Booking Received" locked center>
      <div className="mx-auto flex min-h-80 max-w-3xl flex-col items-center justify-center rounded-3xl border border-black/60 bg-[#f9f9f9] px-5 py-10 text-center">
        <div className="grid size-28 place-items-center rounded-full bg-primary text-white md:size-32">
          <Check className="size-16 md:size-20" strokeWidth={3} />
        </div>
        <div role="status" className="mt-6 space-y-1">
          <p className="text-[20px] font-semibold">
            {formatLongDate(confirmed.date)}
          </p>
          <p className="text-[16px]">
            {formatRange(confirmed.time, confirmed.time + confirmed.duration)} (
            {formatDuration(confirmed.duration)})
          </p>
          <p className="pt-2 text-[16px] text-gray-700">
            {list.map((s) => s.name).join(", ")}
          </p>
          <p className="text-[16px] font-semibold">
            Total {confirmed.total > 0 ? formatGBP(confirmed.total) : "Free"}
          </p>
          {confirmed.deposit > 0 && (
            <p className="text-[15px] text-gray-700">
              Deposit to secure your booking: {formatGBP(confirmed.deposit)}
            </p>
          )}
        </div>
        <p className="mt-5 max-w-md text-[15px] text-gray-700">
          Thank you! The salon will confirm your appointment shortly
          {confirmed.deposit > 0 ? " and get in touch about the deposit" : ""}.
          You can see this booking in your account.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/account"
            className="rounded-full bg-primary px-8 py-2.5 text-[15px] font-semibold text-white"
          >
            View my bookings
          </Link>
          <button
            type="button"
            onClick={() => {
              reset();
              router.push("/booking");
            }}
            className="rounded-full border border-primary px-8 py-2.5 text-[15px] font-semibold text-primary hover:bg-card"
          >
            Book another
          </button>
        </div>
      </div>
    </BookingShell>
  );
};

export default ConfirmedStep;
