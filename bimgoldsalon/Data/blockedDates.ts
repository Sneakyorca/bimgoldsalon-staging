import "server-only";
import { createClient } from "@/lib/supabase/server";

export type BlockedDateRow = { id: string; date: string; reason: string };
export type Result = { ok: true } | { ok: false; error: string };

export async function listBlockedDates(): Promise<BlockedDateRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocked_dates")
    .select("id, date, reason")
    .order("date", { ascending: true })
    .limit(500);
  if (error) throw new Error("Could not load blocked dates.");
  return (data as { id: number; date: string; reason: string }[]).map((r) => ({
    id: String(r.id),
    date: r.date,
    reason: r.reason,
  }));
}

export async function addBlockedDateRecord(
  date: string,
  reason: string,
): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blocked_dates")
    .insert({ date, reason: reason.trim() });
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "That date is already blocked." };
    console.error("[addBlockedDateRecord]", error.code, error.message);
    return { ok: false, error: "Could not block that date." };
  }
  return { ok: true };
}

export async function removeBlockedDateRecord(id: number): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) {
    console.error("[removeBlockedDateRecord]", error.code, error.message);
    return { ok: false, error: "Could not reopen that date." };
  }
  return { ok: true };
}
