import { supabase } from "../libs/supabase";

export async function getAnalyticsSummary() {
  const { data, error } = await supabase
    .from("admin_analytics")
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getTopServices() {
  const { data, error } = await supabase.from("top_services").select("*");
  if (error) throw error;
  return data;
}

export async function getTopProducts() {
  const { data, error } = await supabase.from("top_products").select("*");
  if (error) throw error;
  return data;
}
