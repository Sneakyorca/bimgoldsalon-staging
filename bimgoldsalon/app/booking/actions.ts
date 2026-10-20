"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAvailability } from "@/Data/availability";
import { createBookingRecord } from "@/Data/bookings";
import { createBookingCheckout, releaseUnpaidBooking } from "@/Data/payments";
import { notifyBookingCreated } from "@/lib/email/notify";
import { getServices } from "@/Data/services";
import { getCurrentUser } from "@/lib/auth/dal";
import { getSettings } from "@/Data/settings";
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
import { stripeEnabled } from "@/lib/stripe";

export type BookingResult =
  | {
      ok: true;
      booking: {
        id: string;
        duration: number;
        total: number;
        deposit: number;
        /** Stripe's payment page, when a deposit is due */
        paymentUrl?: string;
      };
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

  // Opening hours, time steps, lead time and booking window (set in Admin → Settings)
  const settings = await getSettings();
  const today = salonToday();
  if (
    !dateWindow(today.date, settings.windowDays).includes(date) ||
    !candidateSlots(date, duration, today, settings).includes(time)
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
  const deposit = depositFor(list);
  const booking = { id: res.id, duration, total: price, deposit };

  // A deposit is due: send the customer to Stripe's payment page
  if (deposit > 0 && stripeEnabled()) {
    try {
      const paymentUrl = await createBookingCheckout(res.id, user.email);
      return { ok: true, booking: { ...booking, paymentUrl } };
    } catch (e) {
      console.error("[createBookingAction] could not open the payment page", e);
      await releaseUnpaidBooking(res.id); // free the time slot again
      revalidatePath("/booking", "layout");
      return {
        ok: false,
        error: "We couldn't open the payment page. Please try again.",
      };
    }
  }
  // Nothing to pay online: the salon confirms it, so tell both sides now
  notifyBookingCreated(res.id);
  return { ok: true, booking };
}
