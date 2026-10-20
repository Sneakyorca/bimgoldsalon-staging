"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createOrderRecord } from "@/Data/orders";
import { createOrderCheckout, releaseUnpaidOrder } from "@/Data/payments";
import { getCurrentUser } from "@/lib/auth/dal";
import { SHIPPING_COUNTRY_CODES } from "@/lib/countries";
import { deliveryAvailability } from "@/lib/delivery";
import { deliveryFeeFor, deliveryOptions } from "@/lib/delivery-options";
import { notifyLowStock } from "@/lib/email/notify";
import { checkoutSchema, type CheckoutValues } from "@/lib/schemas/checkout";
import { stripeEnabled } from "@/lib/stripe";

export type PlaceOrderResult =
  | {
      ok: true;
      orderId: number;
      /** Stripe's payment page. Missing when online payment isn't switched on. */
      paymentUrl?: string;
    }
  | { ok: false; error: string; code?: "login" | "stock" };

const itemsSchema = z
  .array(
    z.object({
      id: z.number().int().min(0),
      qty: z.number().int().min(1).max(99),
    }),
  )
  .min(1)
  .max(50);

export async function placeOrderAction(
  values: CheckoutValues,
  items: { id: number; qty: number }[],
  deliveryMethod: string,
): Promise<PlaceOrderResult> {
  const user = await getCurrentUser();
  if (!user)
    return {
      ok: false,
      code: "login",
      error: "Please sign in to place your order.",
    };

  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success)
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Check your details and try again.",
    };
  const v = parsed.data;

  if (SHIPPING_COUNTRY_CODES && !SHIPPING_COUNTRY_CODES.includes(v.country))
    return { ok: false, error: "Sorry, we don't deliver to that country yet." };

  const itemsParsed = itemsSchema.safeParse(items);
  if (!itemsParsed.success)
    return { ok: false, error: "Your cart looks empty or invalid." };
  // merge duplicates, keep each line within 99
  const merged = new Map<number, number>();
  for (const i of itemsParsed.data)
    merged.set(i.id, Math.min(99, (merged.get(i.id) ?? 0) + i.qty));

  const itemCount = [...merged.values()].reduce((n, q) => n + q, 0);
  // The fee comes from our own list, never from the browser
  const option = deliveryOptions.find((o) => o.id === deliveryMethod);
  if (!option) return { ok: false, error: "Choose a delivery method." };
  const availability = deliveryAvailability()[option.id];
  if (!availability.available)
    return {
      ok: false,
      error:
        availability.reason ??
        "That delivery method isn't available right now.",
    };

  const email = v.email.trim().toLowerCase();
  const res = await createOrderRecord({
    userId: user.id,
    items: [...merged].map(([id, qty]) => ({ id, qty })),
    deliveryMethod: option.id,
    deliveryFee: deliveryFeeFor(option, itemCount),
    name: `${v.firstName} ${v.lastName}`.trim(),
    email,
    phone: v.phone,
    country: v.country,
    street: v.street,
    city: v.city,
    county: v.state,
    postcode:
      v.country === "GB"
        ? v.postcode.toUpperCase().replace(/\s+/g, " ").trim()
        : v.postcode,
    notes: v.notes.trim(),
  });
  if (!res.ok) return res;

  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/product", "layout"); // stock changed
  revalidatePath("/");

  if (!stripeEnabled()) {
    notifyLowStock(res.id);
    return { ok: true, orderId: res.id };
  }

  try {
    const paymentUrl = await createOrderCheckout(res.id, email);
    notifyLowStock(res.id); // stock is reserved now, so tell the salon if it's running low
    return { ok: true, orderId: res.id, paymentUrl };
  } catch (e) {
    console.error("[placeOrderAction] could not open the payment page", e);
    await releaseUnpaidOrder(res.id); // put the stock back
    revalidatePath("/product", "layout");
    return {
      ok: false,
      error: "We couldn't open the payment page. Please try again.",
    };
  }
}
