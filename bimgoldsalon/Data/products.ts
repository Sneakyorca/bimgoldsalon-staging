import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { NO_IMAGE, type Product } from "@/lib/products";
import { flagProduct, withOptionInfo } from "./variants";

const COLUMNS =
  "id, name, description, category, price, sale_price, discount_percent, stock, image_url";

type Row = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number | string;
  sale_price: number | string;
  discount_percent: number | string;
  stock: number;
  image_url: string;
};

const toProduct = (r: Row): Product => ({
  id: r.id,
  name: r.name,
  blurb: r.description,
  price: Number(r.sale_price),
  originalPrice: Number(r.price),
  discountPercent: Number(r.discount_percent),
  category: r.category,
  stock: r.stock,
  inStock: r.stock > 0,
  image: r.image_url || NO_IMAGE,
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .order("id", { ascending: true })
    .limit(500);

  if (error) throw new Error("Could not load products.");

  const list = (data as Row[]).map(toProduct);
  return withOptionInfo(list);
});

export const getProductById = cache(
  async (rawId: string): Promise<Product | null> => {
    if (!/^\d{1,12}$/.test(rawId)) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(COLUMNS)
      .eq("id", Number(rawId))
      .maybeSingle();

    if (error) throw new Error("Could not load the product.");
    if (!data) return null;

    const product = toProduct(data as Row);
    return flagProduct(product);
  },
);

export async function getRelatedProducts(
  category: string,
  excludeId: number,
  limit = 4,
): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("category", category)
    .neq("id", excludeId)
    .order("id", { ascending: true })
    .limit(limit);

  if (error) throw new Error("Could not load related products.");

  const list = (data as Row[]).map(toProduct);
  return withOptionInfo(list);
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .in("id", ids);
  if (error) throw new Error("Could not load cart products.");
  return (data as Row[]).map(toProduct);
}

export async function getCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .order("category", { ascending: true });
  if (error) throw new Error("Could not load categories.");
  return [...new Set((data as { category: string }[]).map((r) => r.category))];
}

export async function getProductGallery(productId: number): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error("Could not load product photos.");
  return (data as { image_url: string }[]).map((r) => r.image_url);
}
