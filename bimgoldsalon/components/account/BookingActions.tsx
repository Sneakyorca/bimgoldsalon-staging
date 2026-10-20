import { getSettings } from "@/Data/settings";
import type { BookingView } from "@/lib/auth/api";
import { minutesUntil, parseHHMM } from "@/lib/booking";
import CancelBookingButton from "./CancelBookingButton";

export default async function BookingActions({
  booking,
}: {
  booking: BookingView;
}) {
  if (booking.status !== "pending" && booking.status !== "confirmed")
    return null;
  const mins = minutesUntil(booking.date, parseHHMM(booking.time));
  if (mins <= 0) return null;

  const { cancellationHours } = await getSettings();
  if (mins >= cancellationHours * 60)
    return <CancelBookingButton bookingId={booking.id} />;

  return (
    <p className="mt-3 text-[13px] text-muted-foreground">
      This appointment is less than {cancellationHours} hours away. To change
      it, please contact the salon.
    </p>
  );
}
