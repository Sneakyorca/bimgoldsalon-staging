import { supabase } from "../libs/supabase";

export async function getProductImages(productId) {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addProductImages(productId, imageUrls) {
  const rows = imageUrls.map((url, i) => ({
    product_id: productId,
    image_url: url,
    sort_order: i,
  }));

  const { error } = await supabase.from("product_images").insert(rows);
  if (error) throw error;
}

export async function deleteProductImage(imageId) {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);
  if (error) throw error;
}
