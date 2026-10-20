import "server-only";
import { salonToday } from "@/lib/booking";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Result = { ok: true } | { ok: false; error: string };

export type WaitlistView = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  serviceNames: string;
  preferredDate: string;
  note: string;
  notifiedAt: string | null;
  createdAt: string;
};

const SELECT =
  "id, user_id, name, email, phone, service_names, preferred_date, note, notified_at, created_at";
type Row = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  service_names: string;
  preferred_date: string;
  note: string;
  notified_at: string | null;
  created_at: string;
};
const toView = (r: Row): WaitlistView => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  serviceNames: r.service_names,
  preferredDate: r.preferred_date,
  note: r.note,
  notifiedAt: r.notified_at,
  createdAt: r.created_at,
});

export async function addWaitlistEntry(input: {
  userId: string;
  name: string;
  email: string;
  phone: string;
  serviceIds: number[];
  serviceNames: string;
  date: string;
  note: string;
}): Promise<{ ok: true; already: boolean } | { ok: false; error: string }> {
  const db = createAdminClient();
  const { count } = await db
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .gte("preferred_date", salonToday().date);
  if ((count ?? 0) >= 5)
    return {
      ok: false,
      error:
        "You're already on the waitlist for several days. Please wait for those first.",
    };

  const { error } = await db.from("waitlist").insert({
    user_id: input.userId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    service_ids: input.serviceIds,
    service_names: input.serviceNames,
    preferred_date: input.date,
    note: input.note,
  });
  if (error) {
    if (error.code === "23505") return { ok: true, already: true };
    console.error("[addWaitlistEntry]", error.code, error.message);
    return {
      ok: false,
      error: "Could not join the waitlist. Please try again.",
    };
  }
  return { ok: true, already: false };
}

/** Admin only (row-level security returns nothing for anyone else) */
export async function listWaitlist(): Promise<WaitlistView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("waitlist")
    .select(SELECT)
    .order("preferred_date", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw new Error("Could not load the waitlist.");
  return (data as Row[]).map(toView);
}

export async function deleteWaitlistRecord(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").delete().eq("id", id);
  if (error) {
    console.error("[deleteWaitlistRecord]", error.code, error.message);
    return { ok: false, error: "Could not remove the entry." };
  }
  return { ok: true };
}

/** People waiting for this date who haven't been emailed in the last 12 hours */
export async function entriesDueForDate(date: string): Promise<WaitlistView[]> {
  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const { data } = await createAdminClient()
    .from("waitlist")
    .select(SELECT)
    .eq("preferred_date", date)
    .or(`notified_at.is.null,notified_at.lt.${cutoff}`)
    .limit(20);
  return ((data ?? []) as Row[]).map(toView);
}

export async function getWaitlistEntryAdmin(
  id: string,
): Promise<WaitlistView | null> {
  const { data } = await createAdminClient()
    .from("waitlist")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? toView(data as Row) : null;
}

export async function markWaitlistNotified(ids: string[]) {
  if (ids.length === 0) return;
  await createAdminClient()
    .from("waitlist")
    .update({ notified_at: new Date().toISOString() })
    .in("id", ids);
}
