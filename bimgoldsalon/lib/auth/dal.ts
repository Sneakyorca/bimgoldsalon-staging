import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/Data/profile";
import type { PublicUser } from "./api";

// getUser() asks Supabase to verify the session, so a forged or revoked
// cookie can't pass. The role comes from the profiles table, never from
// user_metadata (which users can edit themselves).
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const profile = await getProfile(data.user.id);
  return {
    id: data.user.id,
    name: profile?.full_name ?? "",
    email: data.user.email ?? "",
    phone: profile?.phone ?? "",
    role: profile?.role === "admin" ? "admin" : "customer",
  };
});

export async function requireUser(next = "/account"): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") notFound();
  return user;
}
