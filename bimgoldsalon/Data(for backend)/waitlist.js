import { supabase } from "../libs/supabase";

export async function addToWaitlist({
  userId,
  serviceId,
  preferredDate,
  name,
  email,
  phone,
}) {
  const { error } = await supabase.from("waitlist").insert({
    user_id: userId,
    service_id: serviceId,
    preferred_date: preferredDate || null,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
  });

  if (error) throw error;
}
export async function getWaitlist() {
  const { data, error } = await supabase
    .from("waitlist")
    .select("*, services(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteWaitlistEntry(id) {
  const { error } = await supabase.from("waitlist").delete().eq("id", id);
  if (error) throw error;
}
