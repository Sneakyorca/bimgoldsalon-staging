"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createOrderRecord } from "@/Data/orders";
import { deliveryOptions } from "@/lib/delivery-options.ts";
import { getCurrentUser } from "@/lib/auth/dal";
import { SHIPPING_COUNTRY_CODES } from "@/lib/countries";
import { deliveryAvailability } from "@/lib/delivery";
import { checkoutSchema, type CheckoutValues } from "@/lib/schemas/checkout";

export type PlaceOrderResult =
  | { ok: true; orderId: number }
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

  const res = await createOrderRecord({
    userId: user.id,
    items: [...merged].map(([id, qty]) => ({ id, qty })),
    deliveryMethod: option.id,
    deliveryFee: option.fee,
    name: `${v.firstName} ${v.lastName}`.trim(),
    email: v.email.trim().toLowerCase(),
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
  return { ok: true, orderId: res.id };
}
