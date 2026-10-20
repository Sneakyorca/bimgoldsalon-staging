import "server-only";
import type { BookingStatus } from "@/lib/statuses";
import type { BookingView } from "@/lib/auth/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { minutesUntil } from "@/lib/booking";
import { readSettings } from "./settings";

export type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });

const hhmm = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const SELECT =
  "id, user_id, booking_date, start_min, duration_min, total_price, deposit_amount, status, is_paid, notes, customer_name, customer_phone, customer_email, booking_services(service_id, service_name, sort_order)";

type Row = {
  id: string;
  user_id: string | null;
  booking_date: string;
  start_min: number;
  duration_min: number;
  total_price: number | string;
  deposit_amount: number | string;
  status: string;
  is_paid: boolean;
  notes: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  booking_services:
    | { service_id: number | null; service_name: string; sort_order: number }[]
    | null;
};

// Same shape the dashboard and admin already use
const toView = (r: Row): BookingView => {
  const lines = [...(r.booking_services ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return {
    id: r.id,
    userId: r.user_id ?? "",
    serviceId: lines[0]?.service_id != null ? String(lines[0].service_id) : "",
    date: r.booking_date,
    time: hhmm(r.start_min),
    status: r.status as BookingStatus,
    isPaid: r.is_paid,
    depositAmount: Number(r.deposit_amount),
    notes: r.notes,
    serviceName: lines.map((l) => l.service_name).join(" + ") || "Service",
    price: Number(r.total_price),
    durationMin: r.duration_min,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
  };
};

export async function listBookingsForUser(
  userId: string,
): Promise<BookingView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(SELECT)
    .eq("user_id", userId)
    .order("booking_date", { ascending: false })
    .order("start_min", { ascending: false })
    .limit(200);
  if (error) throw new Error("Could not load your bookings.");
  return (data as unknown as Row[]).map(toView);
}

/** Admin only (row-level security returns nothing for anyone else) */
export async function listAllBookings(): Promise<BookingView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(SELECT)
    .order("booking_date", { ascending: false })
    .order("start_min", { ascending: false })
    .limit(1000);
  if (error) throw new Error("Could not load bookings.");
  return (data as unknown as Row[]).map(toView);
}

const MESSAGES: Record<string, string> = {
  slot_taken: "That time was just taken. Please pick another time.",
  date_blocked: "Sorry, we're closed on that day. Please choose another date.",
  too_many_pending:
    "You already have several bookings waiting for confirmation. Please wait for the salon to confirm them first.",
  invalid_services:
    "One of the services you picked is no longer available. Please choose again.",
  invalid_time: "That time isn't valid. Please pick another.",
};

export async function createBookingRecord(input: {
  userId: string;
  name: string;
  phone: string;
  email: string;
  serviceIds: number[];
  date: string;
  startMin: number;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  // Server-only function in the database, so it uses the admin client
  const { data, error } = await createAdminClient().rpc("create_booking", {
    p_user_id: input.userId,
    p_service_ids: input.serviceIds,
    p_date: input.date,
    p_start_min: input.startMin,
    p_name: input.name,
    p_phone: input.phone,
    p_email: input.email,
  });
  if (error) {
    const code = Object.keys(MESSAGES).find((k) => error.message.includes(k));
    if (!code)
      console.error("[createBookingRecord]", error.code, error.message);
    return {
      ok: false,
      error: code
        ? MESSAGES[code]
        : "Could not create your booking. Please try again.",
    };
  }
  return { ok: true, id: data as string };
}

// Admin updates go through the normal client, so row-level security applies
async function update(
  id: string,
  patch: Record<string, unknown>,
): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update(patch).eq("id", id);
  if (error) {
    console.error("[updateBooking]", error.code, error.message);
    return fail("Could not update the booking.");
  }
  return { ok: true };
}
export const setBookingStatusRecord = (id: string, status: string) =>
  update(id, { status });
export const setBookingPaidRecord = (id: string, paid: boolean) =>
  update(id, { is_paid: paid });
export const setBookingNotesRecord = (id: string, notes: string) =>
  update(id, { notes: notes.slice(0, 1000) });
/** A customer cancelling their own booking. The rules are checked here, not in the browser. */
export async function cancelBookingForUser(
  userId: string,
  bookingId: string,
  minHoursBefore: number,
): Promise<Result> {
  const supabase = await createClient(); // row-level security: own bookings only
  const { data } = await supabase
    .from("bookings")
    .select("id, booking_date, start_min, status")
    .eq("id", bookingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return fail("Booking not found.");
  if (data.status !== "pending" && data.status !== "confirmed")
    return fail("This booking can't be cancelled.");
  if (minutesUntil(data.booking_date, data.start_min) < minHoursBefore * 60)
    return fail(
      `Bookings can only be cancelled online at least ${minHoursBefore} hours before. Please contact the salon.`,
    );

  // Customers have no update permission, so the server does it
  const { error } = await createAdminClient()
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("user_id", userId)
    .in("status", ["pending", "confirmed"]);
  if (error) {
    console.error("[cancelBookingForUser]", error.code, error.message);
    return fail("Could not cancel the booking. Please try again.");
  }
  return { ok: true };
}
export async function getBookingForUser(
  userId: string,
  bookingId: string,
): Promise<BookingView | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(SELECT)
    .eq("id", bookingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Could not load the booking.");
  return data ? toView(data as unknown as Row) : null;
}
/** For emails: a booking with its service lines, via the admin client */
export async function getBookingByIdAdmin(bookingId: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("bookings")
    .select(SELECT)
    .eq("id", bookingId)
    .maybeSingle();
  if (!data) return null;
  const { data: lines } = await db
    .from("booking_services")
    .select("service_name, price, duration_min, sort_order")
    .eq("booking_id", bookingId)
    .order("sort_order", { ascending: true });
  const { cancellationHours } = await readSettings();
  return {
    ...toView(data as unknown as Row),
    cancellationHours,
    lines: (
      (lines ?? []) as {
        service_name: string;
        price: number | string;
        duration_min: number;
      }[]
    ).map((l) => ({
      name: l.service_name,
      price: Number(l.price),
      durationMin: l.duration_min,
    })),
  };
}

export async function getBookingStatusRecord(
  bookingId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", bookingId)
    .maybeSingle();
  return (data?.status as string | undefined) ?? null;
}
