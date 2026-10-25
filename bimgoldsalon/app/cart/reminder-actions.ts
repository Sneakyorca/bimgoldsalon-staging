"use server";

import { z } from "zod";
import { getSavedCart, saveCartRecord } from "@/Data/reminders";
import { getCurrentUser } from "@/lib/auth/dal";

const lines = z
  .array(
    z.object({
      id: z.number().int().min(0),
      qty: z.number().int().min(1).max(99),
    }),
  )
  .max(50);

/** Keeps a copy of a signed-in customer's basket (used for the reminder email) */
export async function syncCartAction(
  input: { id: number; qty: number }[],
): Promise<{ ok: boolean }> {
  try {
    const user = await getCurrentUser();
    const parsed = lines.safeParse(input);
    if (!user || !user.email || !parsed.success) return { ok: false };
    await saveCartRecord(
      { id: user.id, email: user.email, name: user.name || "" },
      parsed.data,
    );
    return { ok: true };
  } catch (e) {
    console.error("[syncCartAction]", e);
    return { ok: false };
  }
}

/** Lets the basket follow a customer to another device */
export async function getSavedCartAction(): Promise<
  { id: number; qty: number }[]
> {
  try {
    const user = await getCurrentUser();
    return user ? await getSavedCart(user.id) : [];
  } catch (e) {
    console.error("[getSavedCartAction]", e);
    return [];
  }
}
