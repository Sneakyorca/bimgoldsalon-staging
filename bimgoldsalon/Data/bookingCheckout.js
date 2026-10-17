import { getCurrentUser } from "./auth.js";
import { createBooking, confirmBookingPayment } from "./bookingService.js";
import { supabase } from "../libs/supabase";

export async function submitBookingPayment({
  serviceId,
  date,
  time,
  depositAmount,
  contact,
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please login first.");

  // 1. Reserve the slot first — DB unique constraint + friendly error from createBooking.
  const booking = await createBooking(
    user.id,
    serviceId,
    date,
    time,
    depositAmount,
    contact,
  );

  // 2. Free services (e.g. consultations) skip Stripe entirely — confirm right away.
  // 2. Free services (e.g. consultations) skip Stripe entirely — confirm right away.
  if (Number(depositAmount) <= 0) {
    await confirmBookingPayment(booking.id, true);

    try {
      await supabase.functions.invoke("send-booking-email", {
        body: { bookingId: booking.id },
      });
    } catch (err) {
      console.error("Booking email failed:", err);
      // don't block navigation on email failure — booking itself succeeded
    }

    window.location.href = `${window.location.origin}/payment/success?type=booking&id=${booking.id}&free=true`;
    return;
  }

  // 3. Paid services — create the Stripe Checkout Session.
  const { data, error } = await supabase.functions.invoke(
    "create-checkout-session",
    {
      body: { type: "booking", id: booking.id, origin: window.location.origin },
    },
  );

  if (error || !data?.url) {
    await confirmBookingPayment(booking.id, false);
    throw new Error(
      error?.message || "Could not start checkout. Please try again.",
    );
  }

  window.location.href = data.url;
}
