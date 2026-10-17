import "server-only";
import {
  dateWindow,
  freeSlots,
  salonToday,
  type Availability,
  type Busy,
  type Limits,
} from "@/lib/booking";
import { createClient } from "@/lib/supabase/server";

/** Free start times for every bookable day, for this combination of services */
export async function getAvailability(
  serviceIds: number[],
): Promise<Availability> {
  const today = salonToday();
  const dates = dateWindow(today.date);
  const first = dates[0];
  const last = dates[dates.length - 1];

  const supabase = await createClient();
  const [servicesRes, busyRes, blockedRes, settingsRes] = await Promise.all([
    supabase
      .from("services")
      .select("id, duration_min, capacity")
      .in("id", serviceIds),
    supabase.rpc("get_busy_ranges", { p_from: first, p_to: last }),
    supabase
      .from("blocked_dates")
      .select("date")
      .gte("date", first)
      .lte("date", last),
    supabase.from("salon_settings").select("booking_capacity").maybeSingle(),
  ]);

  const services = (servicesRes.data ?? []) as {
    id: number;
    duration_min: number;
    capacity: number;
  }[];
  if (servicesRes.error || services.length !== serviceIds.length)
    throw new Error("Those services aren't available.");
  if (busyRes.error || blockedRes.error) {
    console.error(
      "[getAvailability]",
      busyRes.error?.message,
      blockedRes.error?.message,
    );
    throw new Error("Could not load availability.");
  }

  const duration = services.reduce((n, s) => n + s.duration_min, 0);
  const limits: Limits = {
    overall: Math.max(1, Number(settingsRes.data?.booking_capacity ?? 10)),
    perService: Object.fromEntries(
      services.map((s) => [s.id, s.capacity]),
    ) as Record<number, number>,
  };

  const blocked = new Set(
    ((blockedRes.data ?? []) as { date: string }[]).map((r) => r.date),
  );
  const busyByDate = new Map<string, Busy[]>();
  for (const r of (busyRes.data ?? []) as {
    booking_date: string;
    start_min: number;
    end_min: number;
    service_ids: number[] | null;
  }[]) {
    const list = busyByDate.get(r.booking_date) ?? [];
    list.push({
      start: r.start_min,
      end: r.end_min,
      serviceIds: r.service_ids ?? [],
    });
    busyByDate.set(r.booking_date, list);
  }

  const slots: Record<string, number[]> = {};
  for (const d of dates) {
    slots[d] = blocked.has(d)
      ? []
      : freeSlots(
          d,
          duration,
          busyByDate.get(d) ?? [],
          serviceIds,
          limits,
          today,
        );
  }
  return { dates, slots };
}
