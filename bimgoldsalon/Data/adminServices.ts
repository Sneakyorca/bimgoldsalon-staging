import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AdminService, ServiceInput } from "@/lib/services";
import { removeCatalogImages } from "./storage";

export type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });

type ImageRow = {
  image_url: string;
  service_images: { image_url: string }[] | null;
};
type Row = ImageRow & {
  id: number;
  name: string;
  category: string;
  price: number | string;
  duration_min: number;
  duration_label: string;
  deposit_percent: number | string;
  featured: boolean;
  capacity: number;
  extra_info: Record<string, string> | null;
  service_images: { image_url: string; sort_order: number }[] | null;
};

const SELECT =
  "id, name, category, price, duration_min, duration_label, deposit_percent, featured, capacity, image_url, extra_info, service_images(image_url, sort_order)";

const urlsOf = (row: ImageRow) => [
  row.image_url,
  ...(row.service_images ?? []).map((i) => i.image_url),
];

const toAdmin = (r: Row): AdminService => ({
  id: r.id,
  name: r.name,
  category: r.category,
  price: Number(r.price),
  durationMin: r.duration_min,
  durationLabel: r.duration_label,
  depositPercent: Number(r.deposit_percent),
  featured: r.featured,
  capacity: r.capacity,
  image: r.image_url,
  images: [...(r.service_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.image_url),
  extraInfo: r.extra_info ?? {},
});

export async function listAdminServices(): Promise<AdminService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(SELECT)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
    .limit(500);
  if (error) throw new Error("Could not load services.");
  return (data as unknown as Row[]).map(toAdmin);
}

export async function saveServiceRecord(
  id: number | null,
  input: ServiceInput,
): Promise<Result> {
  const supabase = await createClient();
  const row = {
    name: input.name,
    category: input.category,
    price: Math.round(input.price * 100) / 100,
    duration_min: input.durationMin,
    duration_label: input.durationLabel,
    deposit_percent: Math.round(input.depositPercent * 100) / 100,
    featured: input.featured,
    capacity: input.capacity,
    image_url: input.image,
    extra_info: input.extraInfo,
  };

  let serviceId = id;
  let oldUrls: string[] = [];

  if (id === null) {
    // new services go to the end of the list
    const { data: last } = await supabase
      .from("services")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("services")
      .insert({ ...row, sort_order: ((last?.sort_order as number) ?? -1) + 1 })
      .select("id")
      .single();
    if (error || !data) {
      console.error("[saveServiceRecord:insert]", error?.code, error?.message);
      return fail("Could not save the service.");
    }
    serviceId = data.id as number;
  } else {
    const { data: existing } = await supabase
      .from("services")
      .select("image_url, service_images(image_url)")
      .eq("id", id)
      .maybeSingle();
    if (!existing) return fail("Service not found.");
    oldUrls = urlsOf(existing as unknown as ImageRow);

    const { error } = await supabase.from("services").update(row).eq("id", id);
    if (error) {
      console.error("[saveServiceRecord:update]", error.code, error.message);
      return fail("Could not save the service.");
    }
  }

  const { error: galleryError } = await supabase.rpc("replace_service_images", {
    p_service_id: serviceId,
    p_urls: input.images,
  });
  if (galleryError) {
    console.error("[saveServiceRecord:gallery]", galleryError.message);
    return fail("Saved, but the extra photos could not be updated. Try again.");
  }

  const kept = new Set([input.image, ...input.images]);
  await removeCatalogImages(oldUrls.filter((u) => !kept.has(u)));
  return { ok: true };
}

export async function deleteServiceRecord(id: number): Promise<Result> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("services")
    .select("image_url, service_images(image_url)")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) {
    console.error("[deleteServiceRecord]", error.code, error.message);
    return fail("Could not delete the service.");
  }
  if (existing)
    await removeCatalogImages(urlsOf(existing as unknown as ImageRow));
  return { ok: true };
}
