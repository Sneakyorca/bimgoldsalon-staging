"use client";
import { useState, useTransition } from "react";
import { cancelMyBookingAction } from "@/app/account/booking-actions";

export default function CancelBookingButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const cancel = () =>
    startTransition(async () => {
      setError("");
      const res = await cancelMyBookingAction(bookingId);
      if (!res.ok) {
        setError(res.error);
        setArmed(false);
      }
    });

  return (
    <div className="mt-3">
      {armed ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px]">Cancel this booking?</span>
          <button
            type="button"
            onClick={cancel}
            disabled={pending}
            className="rounded-full bg-red-600 px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Cancelling…" : "Yes, cancel"}
          </button>
          <button
            type="button"
            onClick={() => setArmed(false)}
            disabled={pending}
            className="rounded-full border border-black/40 px-4 py-1.5 text-[13px]"
          >
            Keep it
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="text-[14px] font-semibold text-red-600 underline"
        >
          Cancel booking
        </button>
      )}
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
