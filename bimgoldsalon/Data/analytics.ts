import "server-only";
import { RANGES, type Analytics, type RangeId } from "@/lib/analytics";
import { fromISODate, salonToday, toISODate } from "@/lib/booking";
import { createAdminClient } from "@/lib/supabase/admin";

const londonDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(
    new Date(iso),
  );
const addDays = (iso: string, n: number) => {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};
const mondayOf = (iso: string) => {
  const d = fromISODate(iso);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toISODate(d);
};
const one = <T>(v: T | T[] | null | undefined): T | undefined =>
  Array.isArray(v) ? v[0] : (v ?? undefined);
const round = (n: number) => Math.round(n * 100) / 100;

export async function getAnalytics(range: RangeId): Promise<Analytics> {
  const cfg = RANGES.find((r) => r.id === range) ?? RANGES[1];
  const today = salonToday().date;
  const monthly = range === "12m";
  const weekly = range === "90d";

  let start: string;
  if (monthly) {
    const d = fromISODate(today);
    d.setDate(1);
    d.setMonth(d.getMonth() - 11);
    start = toISODate(d);
  } else start = addDays(today, -(cfg.days - 1));

  const keyOf = (iso: string) =>
    monthly ? iso.slice(0, 7) : weekly ? mondayOf(iso) : iso;
  const labelOf = (key: string) =>
    monthly
      ? fromISODate(`${key}-01`).toLocaleDateString("en-GB", {
          month: "short",
          year: "2-digit",
        })
      : (weekly ? "w/c " : "") +
        fromISODate(key).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        });

  const buckets = new Map<string, { products: number; deposits: number }>();
  for (let d = start; d <= today; d = addDays(d, 1)) {
    const k = keyOf(d);
    if (!buckets.has(k)) buckets.set(k, { products: 0, deposits: 0 });
  }

  // a day of slack at the start, because rows are bucketed by their London date below
  const since = `${addDays(start, -1)}T00:00:00Z`;
  const db = createAdminClient();
  const [ordersRes, bookingsRes, itemsRes, linesRes] = await Promise.all([
    db
      .from("orders")
      .select("total, payment_status, order_status, created_at")
      .gte("created_at", since)
      .limit(10000),
    db
      .from("bookings")
      .select("deposit_amount, is_paid, status, booking_date, created_at")
      .gte("created_at", since)
      .limit(10000),
    db
      .from("order_items")
      .select(
        "name, price, quantity, orders!inner(created_at, payment_status, order_status)",
      )
      .gte("orders.created_at", since)
      .eq("orders.payment_status", "paid")
      .neq("orders.order_status", "cancelled")
      .limit(20000),
    db
      .from("booking_services")
      .select("service_name, price, bookings!inner(created_at, status)")
      .gte("bookings.created_at", since)
      .not("bookings.status", "in", "(cancelled,payment_failed)")
      .limit(20000),
  ]);
  if (
    ordersRes.error ||
    bookingsRes.error ||
    itemsRes.error ||
    linesRes.error
  ) {
    console.error(
      "[getAnalytics]",
      ordersRes.error?.message,
      bookingsRes.error?.message,
      itemsRes.error?.message,
      linesRes.error?.message,
    );
    throw new Error("Could not load analytics.");
  }

  let productRevenue = 0;
  let paidOrders = 0;
  for (const o of (ordersRes.data ?? []) as {
    total: number | string;
    payment_status: string;
    order_status: string;
    created_at: string;
  }[]) {
    const day = londonDate(o.created_at);
    if (
      day < start ||
      o.payment_status !== "paid" ||
      o.order_status === "cancelled"
    )
      continue;
    const total = Number(o.total);
    productRevenue += total;
    paidOrders++;
    const b = buckets.get(keyOf(day));
    if (b) b.products += total;
  }

  let depositRevenue = 0;
  let bookingCount = 0;
  let cancelled = 0;
  const weekdayCounts = Array<number>(7).fill(0);
  for (const b of (bookingsRes.data ?? []) as {
    deposit_amount: number | string;
    is_paid: boolean;
    status: string;
    booking_date: string;
    created_at: string;
  }[]) {
    const day = londonDate(b.created_at);
    if (day < start) continue;
    if (b.status === "cancelled") cancelled++;
    if (b.is_paid && b.status !== "payment_failed") {
      const dep = Number(b.deposit_amount);
      depositRevenue += dep;
      const bucket = buckets.get(keyOf(day));
      if (bucket) bucket.deposits += dep;
    }
    if (b.status !== "cancelled" && b.status !== "payment_failed") {
      bookingCount++;
      weekdayCounts[fromISODate(b.booking_date).getDay()]++;
    }
  }

  const products = new Map<string, { units: number; revenue: number }>();
  for (const r of (itemsRes.data ?? []) as unknown as {
    name: string;
    price: number | string;
    quantity: number;
    orders: { created_at: string } | { created_at: string }[] | null;
  }[]) {
    const o = one(r.orders);
    if (!o || londonDate(o.created_at) < start) continue;
    const cur = products.get(r.name) ?? { units: 0, revenue: 0 };
    cur.units += r.quantity;
    cur.revenue += Number(r.price) * r.quantity;
    products.set(r.name, cur);
  }

  const services = new Map<string, { bookings: number; value: number }>();
  for (const r of (linesRes.data ?? []) as unknown as {
    service_name: string;
    price: number | string;
    bookings: { created_at: string } | { created_at: string }[] | null;
  }[]) {
    const b = one(r.bookings);
    if (!b || londonDate(b.created_at) < start) continue;
    const cur = services.get(r.service_name) ?? { bookings: 0, value: 0 };
    cur.bookings += 1;
    cur.value += Number(r.price);
    services.set(r.service_name, cur);
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    range,
    kpis: {
      revenue: round(productRevenue + depositRevenue),
      productRevenue: round(productRevenue),
      depositRevenue: round(depositRevenue),
      orders: paidOrders,
      bookings: bookingCount,
      avgOrder: paidOrders ? round(productRevenue / paidOrders) : 0,
      cancelledBookings: cancelled,
    },
    series: [...buckets].map(([key, v]) => ({
      label: labelOf(key),
      products: round(v.products),
      deposits: round(v.deposits),
    })),
    topProducts: [...products]
      .map(([name, v]) => ({ name, units: v.units, revenue: round(v.revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
    topServices: [...services]
      .map(([name, v]) => ({
        name,
        bookings: v.bookings,
        value: round(v.value),
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8),
    weekdays: [1, 2, 3, 4, 5, 6, 0].map((d) => ({
      label: dayNames[d],
      count: weekdayCounts[d],
    })),
  };
}
