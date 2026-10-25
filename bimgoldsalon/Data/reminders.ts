import "server-only";
import { minutesUntil, salonToday } from "@/lib/booking";
import { createAdminClient } from "@/lib/supabase/admin";

export type CartLine = { id: number; qty: number };
export type SavedCart = {
  userId: string;
  email: string;
  name: string;
  items: CartLine[];
  updatedAt: string;
  reminderCount: number;
  lastReminderAt: string | null;
};

const toLines = (v: unknown): CartLine[] =>
  Array.isArray(v)
    ? v.flatMap((l) => {
        const id = Number(l?.id);
        const qty = Number(l?.qty);
        return Number.isInteger(id) && Number.isInteger(qty) && qty > 0
          ? [{ id, qty }]
          : [];
      })
    : [];
const sorted = (l: CartLine[]) =>
  JSON.stringify([...l].sort((a, b) => a.id - b.id));

/* ---------- baskets ---------- */

export async function saveCartRecord(
  user: { id: string; email: string; name: string },
  input: CartLine[],
) {
  const db = createAdminClient();
  const merged = new Map<number, number>();
  for (const l of input)
    merged.set(l.id, Math.min(99, (merged.get(l.id) ?? 0) + l.qty));
  const next = [...merged].map(([id, qty]) => ({ id, qty }));

  const { data: existing } = await db
    .from("saved_carts")
    .select("items")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing && next.length === 0) return; // nothing to remember
  if (existing && sorted(toLines(existing.items)) === sorted(next)) return; // unchanged: keep the timer

  const { error } = await db.from("saved_carts").upsert(
    {
      user_id: user.id,
      email: user.email,
      name: user.name,
      items: next,
      item_count: next.reduce((n, l) => n + l.qty, 0),
      updated_at: new Date().toISOString(),
      reminder_count: 0,
      last_reminder_at: null,
    },
    { onConflict: "user_id" },
  );
  if (error) console.error("[saveCartRecord]", error.code, error.message);
}

export async function getSavedCart(userId: string): Promise<CartLine[]> {
  const { data } = await createAdminClient()
    .from("saved_carts")
    .select("items")
    .eq("user_id", userId)
    .maybeSingle();
  return toLines(data?.items);
}

export async function clearSavedCart(userId: string) {
  await createAdminClient()
    .from("saved_carts")
    .update({
      items: [],
      item_count: 0,
      reminder_count: 0,
      last_reminder_at: null,
    })
    .eq("user_id", userId);
}

export async function optOutOfCartReminders(userId: string) {
  await createAdminClient()
    .from("saved_carts")
    .update({ unsubscribed: true })
    .eq("user_id", userId);
}

export async function listDueCarts(o: {
  olderThanIso: string;
  newerThanIso: string;
  maxReminders: number;
  limit: number;
}): Promise<SavedCart[]> {
  const { data, error } = await createAdminClient()
    .from("saved_carts")
    .select(
      "user_id, email, name, items, updated_at, reminder_count, last_reminder_at",
    )
    .eq("unsubscribed", false)
    .gt("item_count", 0)
    .lt("reminder_count", o.maxReminders)
    .lte("updated_at", o.olderThanIso)
    .gte("updated_at", o.newerThanIso)
    .order("updated_at", { ascending: true })
    .limit(o.limit);
  if (error) {
    console.error("[listDueCarts]", error.code, error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    userId: r.user_id as string,
    email: r.email as string,
    name: (r.name as string) ?? "",
    items: toLines(r.items),
    updatedAt: r.updated_at as string,
    reminderCount: Number(r.reminder_count) || 0,
    lastReminderAt: (r.last_reminder_at as string | null) ?? null,
  }));
}

export async function recordCartReminder(userId: string, count: number) {
  await createAdminClient()
    .from("saved_carts")
    .update({
      reminder_count: count,
      last_reminder_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

export async function hasPriorPurchase(userId: string): Promise<boolean> {
  const db = createAdminClient();
  const [o, b] = await Promise.all([
    db
      .from("orders")
      .select("id", { head: true, count: "exact" })
      .eq("user_id", userId)
      .eq("payment_status", "paid"),
    db
      .from("bookings")
      .select("id", { head: true, count: "exact" })
      .eq("user_id", userId)
      .eq("is_paid", true),
  ]);
  return (o.count ?? 0) > 0 || (b.count ?? 0) > 0;
}

export async function hasPaidOrderSince(
  userId: string,
  sinceIso: string,
): Promise<boolean> {
  const { count } = await createAdminClient()
    .from("orders")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", userId)
    .eq("payment_status", "paid")
    .gte("created_at", sinceIso);
  return (count ?? 0) > 0;
}

/* ---------- appointment reminders ---------- */

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Confirmed bookings that start between (hoursBefore - windowHours) and hoursBefore from now, not yet reminded */
export async function listBookingsToRemind(
  hoursBefore: number,
  windowHours: number,
  limit: number,
) {
  const today = salonToday().date;
  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("id, booking_date, start_min, customer_email")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("booking_date", today)
    .lte("booking_date", addDays(today, Math.ceil(hoursBefore / 24) + 1))
    .limit(500);
  if (error) {
    console.error("[listBookingsToRemind]", error.code, error.message);
    return [];
  }
  const maxMin = hoursBefore * 60;
  const minMin = Math.max(0, (hoursBefore - windowHours) * 60);
  return (
    (data ?? []) as {
      id: string;
      booking_date: string;
      start_min: number;
      customer_email: string;
    }[]
  )
    .filter((b) => {
      const m = minutesUntil(b.booking_date, b.start_min);
      return m > minMin && m <= maxMin;
    })
    .slice(0, limit);
}

/** Marks it as reminded first, so two overlapping runs can't both send. Returns false if someone else got there first. */
export async function claimBookingReminder(id: string): Promise<boolean> {
  const { data } = await createAdminClient()
    .from("bookings")
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq("id", id)
    .is("reminder_sent_at", null)
    .select("id");
  return Boolean(data && data.length > 0);
}

export async function releaseBookingReminder(id: string) {
  await createAdminClient()
    .from("bookings")
    .update({ reminder_sent_at: null })
    .eq("id", id);
}
