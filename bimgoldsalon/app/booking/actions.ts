"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAvailability } from "@/Data/availability";
import { createBookingRecord } from "@/Data/bookings";
import { getServices } from "@/Data/services";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  candidateSlots,
  dateWindow,
  depositFor,
  isISODate,
  salonToday,
  totalsFor,
  type Availability,
} from "@/lib/booking";
import type { Service } from "@/lib/services";

export type BookingResult =
  | {
      ok: true;
      booking: { id: string; duration: number; total: number; deposit: number };
    }
  | { ok: false; error: string; code?: "login" | "phone" };

export async function getCatalogAction(): Promise<Service[]> {
  return getServices();
}

export async function getAvailabilityAction(
  serviceIds: string[],
): Promise<Availability> {
  const ids = z
    .array(z.string().regex(/^\d{1,12}$/))
    .min(1)
    .max(10)
    .parse(serviceIds);
  return getAvailability([...new Set(ids)].map(Number));
}

const bookingInput = z.object({
  serviceIds: z
    .array(z.string().regex(/^\d{1,12}$/))
    .min(1)
    .max(10),
  date: z.string(),
  time: z.number().int().min(0).max(1439),
});

export async function createBookingAction(input: {
  serviceIds: string[];
  date: string;
  time: number;
}): Promise<BookingResult> {
  const parsed = bookingInput.safeParse(input);
  if (!parsed.success || !isISODate(parsed.data.date))
    return { ok: false, error: "Something is missing from your booking." };
  const { date, time } = parsed.data;
  const ids = [...new Set(parsed.data.serviceIds)];

  const user = await getCurrentUser();
  if (!user)
    return { ok: false, code: "login", error: "Please sign in to book." };
  if (!user.phone)
    return {
      ok: false,
      code: "phone",
      error:
        "Please add a phone number to your profile so the salon can reach you.",
    };

  const catalog = await getServices();
  const chosen = ids.map((id) => catalog.find((s) => s.id === id));
  if (chosen.some((s) => !s))
    return {
      ok: false,
      error: "One of the services you picked is no longer available.",
    };
  const list = chosen as Service[];
  const { duration, price } = totalsFor(list);

  // Opening hours, time steps, lead time and booking window
  const today = salonToday();
  if (
    !dateWindow(today.date).includes(date) ||
    !candidateSlots(date, duration, today).includes(time)
  )
    return {
      ok: false,
      error: "That time isn't available. Please pick another.",
    };

  const res = await createBookingRecord({
    userId: user.id,
    name: user.name || user.email,
    phone: user.phone,
    email: user.email,
    serviceIds: ids.map(Number),
    date,
    startMin: time,
  });
  if (!res.ok) return res;

  revalidatePath("/admin");
  revalidatePath("/account");
  return {
    ok: true,
    booking: { id: res.id, duration, total: price, deposit: depositFor(list) },
  };
}
