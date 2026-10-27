import { Fragment } from "react";
import { parking, welcome } from "@/lib/salon";
import PolicyDialogButton from "./PolicyDialog";

export default function BookingWelcome() {
  const parts = welcome.paragraph.split("{parking}");
  return (
    <section
      aria-labelledby="booking-welcome"
      className="mb-5 rounded-2xl border border-black/60 bg-[#f9f9f9] p-5 md:p-6"
    >
      <h2
        id="booking-welcome"
        className="text-[22px] font-semibold leading-tight md:text-[24px]"
      >
        {welcome.title}
      </h2>

      <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-gray-700 md:text-[16px]">
        {parts.map((text, i) => (
          <Fragment key={i}>
            {text}
            {i < parts.length - 1 && (
              <a
                href={parking.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline underline-offset-2 hover:no-underline"
              >
                {parking.name}, {parking.postcode}
              </a>
            )}
          </Fragment>
        ))}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/10 pt-4">
        <PolicyDialogButton className="rounded-full border border-primary px-5 py-2 text-[14px] font-semibold text-primary hover:bg-card">
          Read the booking policy
        </PolicyDialogButton>
        <span className="text-[13px] text-gray-600">
          Booking means you agree to it.
        </span>
      </div>
    </section>
  );
}
