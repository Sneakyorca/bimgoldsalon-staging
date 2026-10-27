"use server";

import { z } from "zod";
import { getProductOptions } from "@/Data/variants";
import type { ProductOptions } from "@/lib/variants";

export async function getProductOptionsAction(
  productId: number,
): Promise<ProductOptions | null> {
  const id = z.number().int().min(0).safeParse(productId);
  if (!id.success) return null;
  try {
    return await getProductOptions(id.data);
  } catch (e) {
    console.error("[getProductOptionsAction]", e);
    return null;
  }
}
