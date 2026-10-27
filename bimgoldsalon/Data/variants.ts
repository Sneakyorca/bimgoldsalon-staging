import "server-only";
import type { Product } from "@/lib/products";
import {
  combinations,
  keyOf,
  variantName,
  selectionsFromKey,
  type AdminOptions,
  type OptionGroup,
  type OptionsInput,
  type ProductOptions,
} from "@/lib/variants";
import { createAdminClient } from "@/lib/supabase/admin";

export type Result = { ok: true } | { ok: false; error: string };

const db = () => createAdminClient();
const num = (v: unknown) => Number(v);
const round2 = (n: number) => Math.round(n * 100) / 100;
const childName = (parentName: string, key: string) =>
  variantName(parentName, key);

type ChildRow = {
  id: number;
  parent_id: number;
  price: number | string;
  sale_price: number | string;
  stock: number;
};

async function loadChildren(): Promise<ChildRow[]> {
  const { data, error } = await db()
    .from("products")
    .select("id, parent_id, price, sale_price, stock")
    .not("parent_id", "is", null)
    .limit(5000);
  if (error) {
    console.error("[variants] load", error.message);
    return [];
  }
  return (data ?? []) as ChildRow[];
}

type Info = { min: number; max: number; minOriginal: number; stock: number };
function buildInfo(rows: ChildRow[]) {
  const info = new Map<number, Info>();
  for (const r of rows) {
    const sale = num(r.sale_price);
    const orig = num(r.price);
    const cur = info.get(r.parent_id);
    if (!cur)
      info.set(r.parent_id, {
        min: sale,
        max: sale,
        minOriginal: orig,
        stock: r.stock,
      });
    else {
      if (sale < cur.min) {
        cur.min = sale;
        cur.minOriginal = orig;
      }
      cur.max = Math.max(cur.max, sale);
      cur.stock += r.stock;
    }
  }
  return info;
}
const apply = (p: Product, i: Info): Product => ({
  ...p,
  hasOptions: true,
  priceFrom: i.max > i.min,
  price: i.min,
  originalPrice: i.minOriginal,
  stock: i.stock,
  inStock: i.stock > 0,
});

/** For product lists: hides the option variants and marks products that have options */
export async function withOptionInfo(products: Product[]): Promise<Product[]> {
  const rows = await loadChildren();
  if (rows.length === 0) return products;
  const childIds = new Set(rows.map((r) => r.id));
  const info = buildInfo(rows);
  return products
    .filter((p) => !childIds.has(p.id))
    .map((p) => {
      const i = info.get(p.id);
      return i ? apply(p, i) : p;
    });
}

/** For one product page: marks it if it has options (never hides it) */
export async function flagProduct(p: Product): Promise<Product> {
  const i = buildInfo(await loadChildren()).get(p.id);
  return i ? apply(p, i) : p;
}

/** For the admin list */
export async function getVariantStats() {
  const rows = await loadChildren();
  const childIds = new Set(rows.map((r) => r.id));
  const byParent = new Map<number, { count: number; stock: number }>();
  for (const r of rows) {
    const cur = byParent.get(r.parent_id) ?? { count: 0, stock: 0 };
    cur.count++;
    cur.stock += r.stock;
    byParent.set(r.parent_id, cur);
  }
  return { childIds, byParent };
}

/** What the product page needs to show the option boxes */
export async function getProductOptions(
  parentId: number,
): Promise<ProductOptions | null> {
  const [parent, kids] = await Promise.all([
    db()
      .from("products")
      .select("option_groups")
      .eq("id", parentId)
      .maybeSingle(),
    db()
      .from("products")
      .select(
        "id, name, variant_key, price, sale_price, discount_percent, stock",
      )
      .eq("parent_id", parentId)
      .order("id"),
  ]);
  const groups = (parent.data?.option_groups ?? []) as OptionGroup[];
  const rows = (kids.data ?? []) as {
    id: number;
    name: string;
    variant_key: string | null;
    price: number | string;
    sale_price: number | string;
    discount_percent: number | string;
    stock: number;
  }[];
  if (!Array.isArray(groups) || groups.length === 0 || rows.length === 0)
    return null;
  return {
    groups,
    variants: rows
      .filter((k) => k.variant_key)
      .map((k) => ({
        id: k.id,
        name: k.name,
        selections: selectionsFromKey(k.variant_key as string),
        price: num(k.sale_price),
        originalPrice: num(k.price),
        discountPercent: num(k.discount_percent),
        stock: k.stock,
      })),
  };
}

/** What the admin editor loads */
export async function getAdminOptions(parentId: number): Promise<AdminOptions> {
  const [parent, kids] = await Promise.all([
    db()
      .from("products")
      .select("option_groups")
      .eq("id", parentId)
      .maybeSingle(),
    db()
      .from("products")
      .select("variant_key, variant_delta, stock")
      .eq("parent_id", parentId),
  ]);
  const groups = (parent.data?.option_groups ?? []) as OptionGroup[];
  return {
    groups: Array.isArray(groups) ? groups : [],
    variants: (
      (kids.data ?? []) as {
        variant_key: string | null;
        variant_delta: number | string;
        stock: number;
      }[]
    )
      .filter((k) => k.variant_key)
      .map((k) => ({
        key: k.variant_key as string,
        priceDelta: num(k.variant_delta),
        stock: k.stock,
      })),
  };
}

const PARENT_COLUMNS =
  "id, name, description, category, price, discount_percent, color, image_url, parent_id";

/** Replaces a product's options. Existing combinations keep their id, so carts keep working. */
export async function saveVariantsRecord(
  parentId: number,
  input: OptionsInput,
): Promise<Result> {
  const client = db();
  const { data: parent } = await client
    .from("products")
    .select(PARENT_COLUMNS)
    .eq("id", parentId)
    .maybeSingle();
  if (!parent) return { ok: false, error: "Product not found." };
  if (parent.parent_id)
    return {
      ok: false,
      error: "Options belong to the main product, not to one of its options.",
    };

  const wanted = new Map(input.variants.map((v) => [v.key, v]));
  const keys = combinations(input.groups).map((picks) =>
    keyOf(input.groups, picks),
  );

  const { data: existing } = await client
    .from("products")
    .select("id, variant_key")
    .eq("parent_id", parentId);
  const existingByKey = new Map(
    ((existing ?? []) as { id: number; variant_key: string }[]).map((e) => [
      e.variant_key,
      e.id,
    ]),
  );

  const stale = ((existing ?? []) as { id: number; variant_key: string }[])
    .filter((e) => !keys.includes(e.variant_key))
    .map((e) => e.id);
  if (stale.length) {
    const { error } = await client.from("products").delete().in("id", stale);
    if (error) {
      console.error("[saveVariants] delete", error.message);
      return { ok: false, error: "Could not remove old options." };
    }
  }

  const fields = (key: string, delta: number, stock: number) => ({
    name: childName(parent.name, key),
    description: parent.description,
    category: parent.category,
    price: round2(num(parent.price) + delta),
    discount_percent: parent.discount_percent,
    stock,
    color: parent.color,
    image_url: parent.image_url,
    parent_id: parentId,
    variant_key: key,
    variant_delta: delta,
  });

  const inserts: ReturnType<typeof fields>[] = [];
  for (const key of keys) {
    const v = wanted.get(key) ?? { key, priceDelta: 0, stock: 0 };
    const id = existingByKey.get(key);
    if (id) {
      const { error } = await client
        .from("products")
        .update(fields(key, v.priceDelta, v.stock))
        .eq("id", id);
      if (error) {
        console.error("[saveVariants] update", error.message);
        return { ok: false, error: "Could not update an option." };
      }
    } else inserts.push(fields(key, v.priceDelta, v.stock));
  }
  if (inserts.length) {
    const { error } = await client.from("products").insert(inserts);
    if (error) {
      console.error("[saveVariants] insert", error.message);
      return { ok: false, error: "Could not add the new options." };
    }
  }

  const { error } = await client
    .from("products")
    .update({ option_groups: input.groups })
    .eq("id", parentId);
  if (error) {
    console.error("[saveVariants] groups", error.message);
    return { ok: false, error: "Could not save the option list." };
  }
  return { ok: true };
}

/** After the main product is edited: copy its name, price, discount, photo etc. to its options */
export async function syncVariantsFromParent(parentId: number) {
  const client = db();
  const { data: parent } = await client
    .from("products")
    .select(PARENT_COLUMNS)
    .eq("id", parentId)
    .maybeSingle();
  if (!parent || parent.parent_id) return;
  const { data: kids } = await client
    .from("products")
    .select("id, variant_key, variant_delta")
    .eq("parent_id", parentId);
  for (const k of (kids ?? []) as {
    id: number;
    variant_key: string;
    variant_delta: number | string;
  }[]) {
    await client
      .from("products")
      .update({
        name: childName(parent.name, k.variant_key),
        description: parent.description,
        category: parent.category,
        price: round2(num(parent.price) + num(k.variant_delta)),
        discount_percent: parent.discount_percent,
        color: parent.color,
        image_url: parent.image_url,
      })
      .eq("id", k.id);
  }
}
/** If this id is one of a product's options, the id of the main product */
export async function getParentId(id: number): Promise<number | null> {
  const { data } = await db()
    .from("products")
    .select("parent_id")
    .eq("id", id)
    .maybeSingle();
  return (data?.parent_id as number | null | undefined) ?? null;
}
