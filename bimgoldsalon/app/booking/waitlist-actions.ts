"use server";

import { z } from "zod";
import { addWaitlistEntry } from "@/Data/waitlist";
import { getAvailability } from "@/Data/availability";
import { getServices } from "@/Data/services";
import { getSettings } from "@/Data/settings";
import { getCurrentUser } from "@/lib/auth/dal";
import { dateWindow, fromISODate, isISODate, salonToday } from "@/lib/booking";
import { createAdminClient } from "@/lib/supabase/admin";

export type WaitlistResult =
  | { ok: true; already: boolean }
  | { ok: false; error: string; code?: "login" | "phone" };

const input = z.object({
  serviceIds: z
    .array(z.string().regex(/^\d{1,12}$/))
    .min(1)
    .max(10),
  date: z.string(),
  note: z.string().trim().max(300).optional(),
});

export async function joinWaitlistAction(raw: {
  serviceIds: string[];
  date: string;
  note?: string;
}): Promise<WaitlistResult> {
  const parsed = input.safeParse(raw);
  if (!parsed.success || !isISODate(parsed.data.date))
    return { ok: false, error: "Choose a date first." };
  const { date } = parsed.data;
  const ids = [...new Set(parsed.data.serviceIds)];

  const user = await getCurrentUser();
  if (!user)
    return {
      ok: false,
      code: "login",
      error: "Please sign in to join the waitlist.",
    };
  if (!user.phone)
    return {
      ok: false,
      code: "phone",
      error:
        "Please add a phone number to your profile so the salon can reach you.",
    };

  const settings = await getSettings();
  const today = salonToday();
  if (date <= today.date)
    return { ok: false, error: "Please choose a date from tomorrow onwards." };
  if (!dateWindow(today.date, settings.windowDays).includes(date))
    return {
      ok: false,
      error: `You can join the waitlist for the next ${settings.windowDays} days.`,
    };

  // Nothing to wait for on a day the salon is closed
  const hours = settings.openingHours[fromISODate(date).getDay()];
  const { data: blocked } = await createAdminClient()
    .from("blocked_dates")
    .select("id")
    .eq("date", date)
    .maybeSingle();
  if (!hours || blocked)
    return {
      ok: false,
      error:
        "The salon is closed that day, so there's nothing to wait for. Please pick another date.",
    };

  try {
    // Only days that are really full for these services
    const avail = await getAvailability(ids.map(Number));
    if ((avail.slots[date]?.length ?? 0) > 0)
      return {
        ok: false,
        error:
          "Good news: there are still times free that day. Please book it directly.",
      };
  } catch {
    return {
      ok: false,
      error: "We couldn't check that day. Please try again.",
    };
  }

  const catalog = await getServices();
  const names = ids
    .map((id) => catalog.find((s) => s.id === id)?.name)
    .filter(Boolean)
    .join(" + ");
  if (!names)
    return {
      ok: false,
      error: "One of those services is no longer available.",
    };

  return addWaitlistEntry({
    userId: user.id,
    name: user.name || user.email,
    email: user.email,
    phone: user.phone,
    serviceIds: ids.map(Number),
    serviceNames: names,
    date,
    note: parsed.data.note ?? "",
  });
}
