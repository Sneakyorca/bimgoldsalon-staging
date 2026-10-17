import { supabase } from "../libs/supabase";

export async function getServiceImages(serviceId) {
  const { data, error } = await supabase
    .from("service_images")
    .select("*")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addServiceImages(serviceId, imageUrls) {
  const rows = imageUrls.map((url, i) => ({
    service_id: serviceId,
    image_url: url,
    sort_order: i,
  }));

  const { error } = await supabase.from("service_images").insert(rows);
  if (error) throw error;
}

export async function deleteServiceImage(imageId) {
  const { error } = await supabase
    .from("service_images")
    .delete()
    .eq("id", imageId);
  if (error) throw error;
}
