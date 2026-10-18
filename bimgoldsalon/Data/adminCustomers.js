import { supabase } from "../libs/supabase";

export async function getCustomers() {
  const { data, error } = await supabase
    .from("bookings")
    .select("customer_name, customer_email, customer_phone, date, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const map = new Map();

  for (const b of data || []) {
    if (!b.customer_email) continue;

    if (!map.has(b.customer_email)) {
      map.set(b.customer_email, {
        name: b.customer_name,
        email: b.customer_email,
        phone: b.customer_phone,
        visits: 0,
        lastBooking: b.date,
      });
    }

    const entry = map.get(b.customer_email);
    entry.visits += 1;
    if (!entry.lastBooking || new Date(b.date) > new Date(entry.lastBooking)) {
      entry.lastBooking = b.date;
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastBooking) - new Date(a.lastBooking),
  );
}
