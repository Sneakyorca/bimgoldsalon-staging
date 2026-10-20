"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import TermsConsent from "@/components/legal/TermsConsent";
import { useBooking } from "@/context/BookingContext";
import { policy } from "@/lib/salon";
import BookingShell from "./BookingShell";
import BookingSummary from "./BookingSummary";

const ConfirmStep = () => {
  const router = useRouter();
  const { ready, services, date, time, confirmBooking } = useBooking();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [needsPhone, setNeedsPhone] = useState(false);

  const complete = services.length > 0 && date !== null && time !== null;
  useEffect(() => {
    if (ready && !complete)
      router.replace(services.length > 0 ? "/booking/time" : "/booking");
  }, [ready, complete, services.length, router]);

  if (!ready || !complete)
    return <div className="min-h-[50vh]" aria-busy="true" />;

  const handleConfirm = async () => {
    if (submitting) return; // no double bookings
    setSubmitting(true);
    setError("");
    setNeedsPhone(false);

    const res = await confirmBooking();
    if (res.ok) {
      if (res.paymentUrl) {
        // Stripe's payment page: the button stays disabled while we leave
        window.location.assign(res.paymentUrl);
        return;
      }
      router.push("/booking/confirmed");
      return;
    }
    if (res.code === "login") {
      // your choices are kept, so they come straight back here after signing in
      router.push("/auth?next=/booking/confirm");
      return;
    }
    setNeedsPhone(res.code === "phone");
    setError(res.error);
    setSubmitting(false);
  };

  return (
    <BookingShell
      step={3}
      title="Review and Confirm"
      summary={
        <div>
          <BookingSummary
            onContinue={handleConfirm}
            label="Confirm booking"
            loading={submitting}
          />
          <TermsConsent action="confirming this booking" className="mt-3" />
          {error && (
            <div
              role="alert"
              className="mt-3 text-center text-[14px] text-red-600"
            >
              <p>{error}</p>
              {needsPhone ? (
                <Link
                  href="/profile/edit"
                  className="mt-1 inline-block font-semibold underline"
                >
                  Add my phone number
                </Link>
              ) : (
                <Link
                  href="/booking/time"
                  className="mt-1 inline-block font-semibold underline"
                >
                  Choose another time
                </Link>
              )}
            </div>
          )}
        </div>
      }
    >
      <h2 className="text-[18px] font-semibold">More details</h2>

      <div className="mt-4 space-y-5">
        <section className="fade-up rounded-2xl border border-black/60 bg-[#f9f9f9] p-5">
          <h3 className="text-[26px] font-semibold leading-tight">
            Cancellation Policy
          </h3>
          <p className="mt-2 text-[16px]">{policy.cancellation}</p>
        </section>

        <section
          className="fade-up rounded-2xl border border-black/60 bg-[#f9f9f9] p-5"
          style={{ "--i": 1 } as CSSProperties}
        >
          <h3 className="text-[26px] font-semibold leading-tight">
            Important Information
          </h3>
          <div className="mt-3 text-[16px] leading-snug">
            <p>{policy.important.heading}</p>
            <p className="mt-4">{policy.important.intro}</p>
            <p className="mt-4">{policy.important.lead}</p>

            {policy.important.sections.map((s) => (
              <div key={s.title} className="mt-5">
                <h4 className="font-medium">{s.title}</h4>
                <ul className="mt-2 space-y-1">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span aria-hidden="true">*</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <p className="mt-6">{policy.important.closing}</p>
          </div>
        </section>
      </div>
    </BookingShell>
  );
};

export default ConfirmStep;
