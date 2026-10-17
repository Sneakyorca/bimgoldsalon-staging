"use server";

import { getProductsByIds } from "@/Data/products";
import type { Product } from "@/lib/products";

export async function getCartProductsAction(ids: number[]): Promise<Product[]> {
  if (!Array.isArray(ids)) return [];
  const clean = [
    ...new Set(ids.filter((n) => Number.isInteger(n) && n >= 0)),
  ].slice(0, 100);
  return getProductsByIds(clean);
}
