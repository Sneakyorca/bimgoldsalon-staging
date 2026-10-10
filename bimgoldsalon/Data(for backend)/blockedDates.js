import { supabase } from "../libs/supabase";

export async function getBlockedDates() {
  const { data, error } = await supabase
    .from("blocked_dates")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addBlockedDate(date, reason) {
  const { data, error } = await supabase
    .from("blocked_dates")
    .insert({ date, reason: reason || null })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("That date is already blocked.");
    }
    throw error;
  }

  return data;
}

export async function removeBlockedDate(id) {
  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) throw error;
}
