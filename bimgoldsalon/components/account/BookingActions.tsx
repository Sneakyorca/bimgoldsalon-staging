import type { BookingView } from "@/lib/auth/api";
import { minutesUntil, parseHHMM } from "@/lib/booking";
import { BUSINESS } from "@/lib/business";
import CancelBookingButton from "./CancelBookingButton";

export default function BookingActions({ booking }: { booking: BookingView }) {
  if (booking.status !== "pending" && booking.status !== "confirmed")
    return null;
  const mins = minutesUntil(booking.date, parseHHMM(booking.time));
  if (mins <= 0) return null;

  if (mins >= BUSINESS.cancellationHours * 60)
    return <CancelBookingButton bookingId={booking.id} />;

  return (
    <p className="mt-3 text-[13px] text-muted-foreground">
      This appointment is less than {BUSINESS.cancellationHours} hours away. To
      change it, please contact the salon.
    </p>
  );
}
