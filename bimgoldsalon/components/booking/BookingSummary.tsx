"use client";

import { ArrowRight, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { useBooking } from "@/context/BookingContext";
import { venue } from "@/lib/salon";
import {
  formatDuration,
  formatGBP,
  formatLongDate,
  formatRange,
} from "@/lib/booking";
import ServiceThumb from "./ServiceThumb";
import Stars from "./Stars";

type Props = {
  onContinue: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
};

const BookingSummary = ({
  onContinue,
  label = "Continue",
  disabled,
  loading,
}: Props) => {
  const { services, date, time, duration, price, deposit } = useBooking();
  const hasSlot = date !== null && time !== null;

  return (
    <div className="rounded-2xl border border-black/50 bg-[#f9f9f9] p-4 md:p-5">
      <div className="flex gap-4">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-black bg-white">
          <Image
            src={venue.image}
            alt=""
            width={96}
            height={96}
            className="h-full w-auto object-contain p-2"
          />
        </div>
        <div className="min-w-0 self-center">
          <p className="text-[15px] font-semibold leading-tight">
            {venue.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[14px]">
            <b>{venue.rating}</b>
            <Stars rating={venue.rating} />
          </p>
          <p className="mt-1 text-[14px] text-gray-600">{venue.location}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-black/40">
        {hasSlot && (
          <div className="space-y-1.5 border-b border-black/40 py-3 text-[14px]">
            <p className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              {formatLongDate(date)}
            </p>
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0" />
              <span>
                {formatRange(time, time + duration)} ({formatDuration(duration)}{" "}
                duration)
              </span>
            </p>
          </div>
        )}

        {services.length === 0 ? (
          <p className="border-b border-black/40 py-3 text-[16px] text-gray-600">
            No service selected
          </p>
        ) : (
          <ul className="divide-y divide-black/10 border-b border-black/40">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <ServiceThumb image={s.image} className="size-10" />
                  <div>
                    <p className="text-[16px] font-medium leading-tight">
                      {s.name}
                    </p>
                    <p className="text-[13px] text-gray-600">
                      {s.durationLabel}
                    </p>
                  </div>
                </div>
                <span className="text-[14px]">{formatGBP(s.fromPrice)}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="flex justify-between py-3 text-[16px] font-semibold">
          <span>Total</span>
          <span>{price > 0 ? formatGBP(price) : "Free"}</span>
        </p>
        {deposit > 0 && (
          <p className="flex justify-between border-t border-black/10 py-3 text-[14px] text-gray-700">
            <span>Deposit to secure your booking</span>
            <span>{formatGBP(deposit)}</span>
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={disabled || loading}
        className="mx-auto mt-8 flex h-10 w-52 items-center justify-center gap-2 rounded-full bg-primary text-[14px] font-semibold text-white transition enabled:hover:opacity-90 enabled:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          "Please wait..."
        ) : (
          <>
            {label} <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </div>
  );
};

export default BookingSummary;
