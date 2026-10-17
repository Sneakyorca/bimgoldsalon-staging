import "server-only";
import type { PublicUser } from "@/lib/auth/api";
import { createClient } from "@/lib/supabase/server";

/** Admin only: the real customer accounts */
export async function listCustomers(): Promise<PublicUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error("Could not load customers.");
  return (
    data as {
      id: string;
      full_name: string;
      email: string | null;
      phone: string | null;
    }[]
  ).map((r) => ({
    id: r.id,
    name: r.full_name,
    email: r.email ?? "",
    phone: r.phone ?? "",
    role: "customer" as const,
    passwordChangedAt: 0, // legacy field from the dummy layer
  }));
}
