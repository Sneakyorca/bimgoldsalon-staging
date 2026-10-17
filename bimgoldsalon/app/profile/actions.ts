"use server";

import { revalidatePath } from "next/cache";
import { editProfileSchema, type EditProfileValues } from "@/lib/schemas/auth";
import { requireUser } from "@/lib/auth/dal";
import { updateProfile } from "@/Data/profile";
import * as auth from "@/Data/auth";

type Result = { ok: false; error: string } | { ok: true; message: string };

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

export async function updateProfileAction(
  values: EditProfileValues,
): Promise<Result> {
  const user = await requireUser("/profile/edit");

  const parsed = editProfileSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Check your details and try again.",
    };
  }
  const { name, email, phone, currentPassword, newPassword } = parsed.data;
  const notes: string[] = [];

  // 1. Password first: if the current password is wrong, nothing else changes
  if (newPassword) {
    const res = await auth.changePasswordWithCurrent(
      currentPassword,
      newPassword,
    );
    if (!res.ok) return res;
    notes.push("Password updated.");
  }

  // 2. Name and phone
  const profile = await updateProfile(user.id, { full_name: name, phone });
  if (!profile.ok) return profile;

  // 3. Email (only if it actually changed)
  if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const res = await auth.changeEmail(email, siteUrl());
    if (!res.ok) return res;
    notes.push(
      "To finish changing your email, confirm the links we sent to both your old and new addresses.",
    );
  }

  revalidatePath("/", "layout");
  return { ok: true, message: ["Profile updated.", ...notes].join(" ") };
}
