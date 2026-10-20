import "server-only";
import { LOW_STOCK_THRESHOLD } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

/** Products an order has just pushed down to the low-stock line (or below) */
export async function loadCrossedLowStock(
  orderId: number,
): Promise<{ name: string; stock: number }[]> {
  const db = createAdminClient();
  const { data: items } = await db
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);
  const lines = (
    (items ?? []) as { product_id: number | null; quantity: number }[]
  ).filter((i) => i.product_id !== null);
  if (lines.length === 0) return [];

  const { data: products } = await db
    .from("products")
    .select("id, name, stock")
    .in(
      "id",
      lines.map((l) => l.product_id as number),
    );

  return ((products ?? []) as { id: number; name: string; stock: number }[])
    .filter((p) => {
      const bought = lines.find((l) => l.product_id === p.id)?.quantity ?? 0;
      // it is low now, and wasn't before this order
      return (
        p.stock <= LOW_STOCK_THRESHOLD && p.stock + bought > LOW_STOCK_THRESHOLD
      );
    })
    .map((p) => ({ name: p.name, stock: p.stock }))
    .sort((a, b) => a.stock - b.stock);
}
