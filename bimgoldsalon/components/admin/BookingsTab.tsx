"use client";
import type { AdminSnapshot } from "@/lib/auth/api";
import { setBookingStatus } from "@/app/admin/actions";
export default function BookingsTab({
  bookings,
}: {
  bookings: AdminSnapshot["bookings"];
}) {
  return (
    <div className="space-y-2">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded bg-white p-4"
        >
          <div>
            <strong>{booking.customerName}</strong>
            <p className="text-sm text-gray-600">
              {booking.serviceName} - {booking.date} at {booking.time}
            </p>
          </div>
          <select
            value={booking.status}
            onChange={(e) => void setBookingStatus(booking.id, e.target.value)}
            className="rounded-full border px-3 py-1 text-sm"
          >
            <option>pending</option>
            <option>confirmed</option>
            <option>completed</option>
            <option>cancelled</option>
            <option>payment_failed</option>
          </select>
        </div>
      ))}
    </div>
  );
}
