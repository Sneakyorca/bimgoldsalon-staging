"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cancelBookingForUser } from "@/Data/bookings";
import { getCurrentUser } from "@/lib/auth/dal";
import { notifyBookingStatus } from "@/lib/email/notify";
import { getSettings } from "@/Data/settings";

export async function cancelMyBookingAction(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = z.string().uuid().safeParse(bookingId);
  if (!id.success) return { ok: false, error: "Invalid booking." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { cancellationHours } = await getSettings();
  const res = await cancelBookingForUser(user.id, id.data, cancellationHours);
  if (res.ok) {
    notifyBookingStatus(id.data, "cancelled", { byCustomer: true });
    revalidatePath("/account");
    revalidatePath("/admin");
    revalidatePath("/booking", "layout");
  }
  return res;
}
