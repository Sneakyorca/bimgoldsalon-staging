import "server-only";
import { cache } from "react";
import { formatDuration } from "@/lib/booking";
import { createClient } from "@/lib/supabase/server";
import { NO_IMAGE } from "@/lib/products";
import type { Service } from "@/lib/services";

const COLUMNS =
  "id, name, category, price, duration_min, duration_label, deposit_percent, featured, image_url, extra_info";

type Row = {
  id: number;
  name: string;
  category: string;
  price: number | string;
  duration_min: number;
  duration_label: string;
  deposit_percent: number | string;
  featured: boolean;
  image_url: string;
  extra_info: Record<string, string> | null;
};

const toService = (r: Row): Service => ({
  id: String(r.id),
  name: r.name,
  category: r.category,
  image: r.image_url || NO_IMAGE,
  featured: r.featured,
  durationMin: r.duration_min,
  durationLabel: r.duration_label || formatDuration(r.duration_min),
  fromPrice: Number(r.price),
  depositPercent: Number(r.deposit_percent),
  details: Object.entries(r.extra_info ?? {}),
});

export const getServices = cache(async (): Promise<Service[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
    .limit(200);
  if (error) throw new Error("Could not load services.");
  return (data as Row[]).map(toService);
});
