import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: "customer" | "admin";
};

/** Strip spaces, dashes and brackets so "0803 123 4567" matches "08031234567". */
export function normalizePhone(phone: string) {
  return phone.replace(/[\s()\-]/g, "");
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role")
    .eq("id", userId)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

// Column grants in the database only allow these two fields to change.
export async function updateProfile(
  userId: string,
  updates: { full_name?: string; phone?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const patch = {
    ...(updates.full_name !== undefined && {
      full_name: updates.full_name.trim(),
    }),
    ...(updates.phone !== undefined && {
      phone: normalizePhone(updates.phone) || null,
    }),
  };
  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId);
  if (error) {
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "That phone number is already in use."
          : "Could not update your profile.",
    };
  }
  return { ok: true };
}
