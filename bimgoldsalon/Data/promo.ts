import "server-only";
import { cache } from "react";
import {
  CATALOG_BUCKET,
  catalogPathFromUrl,
  isCatalogImageUrl,
} from "@/lib/products";
import type { PromoInput } from "@/lib/schemas/promo";
import { createAdminClient } from "@/lib/supabase/admin";

export type Result = { ok: true } | { ok: false; error: string };

export type Promo = {
  enabled: boolean;
  style: "popup" | "banner";
  title: string;
  message: string;
  buttonLabel: string;
  buttonUrl: string;
  image: string;
  startsAt: string | null;
  durationDays: number | null;
  endsAt: string | null;
  repeatHours: number;
  /** changes on every save, so people who closed an old version see the new one */
  version: string;
};

const EMPTY: Promo = {
  enabled: false,
  style: "popup",
  title: "",
  message: "",
  buttonLabel: "",
  buttonUrl: "",
  image: "",
  startsAt: null,
  durationDays: null,
  endsAt: null,
  repeatHours: 24,
  version: "0",
};

type Row = {
  enabled: boolean;
  style: string;
  title: string;
  message: string;
  button_label: string;
  button_url: string;
  image_url: string | null;
  starts_at: string | null;
  duration_days: number | null;
  ends_at: string | null;
  repeat_hours: number;
  updated_at: string;
};

export async function readPromo(): Promise<Promo> {
  const { data, error } = await createAdminClient()
    .from("site_promo")
    .select(
      "enabled, style, title, message, button_label, button_url, image_url, starts_at, duration_days, ends_at, repeat_hours, updated_at",
    )
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("[readPromo]", error.code, error.message);
    return EMPTY;
  }
  const r = data as Row;
  return {
    enabled: Boolean(r.enabled),
    style: r.style === "banner" ? "banner" : "popup",
    title: r.title ?? "",
    message: r.message ?? "",
    buttonLabel: r.button_label ?? "",
    buttonUrl: r.button_url ?? "",
    image: r.image_url ?? "",
    startsAt: r.starts_at,
    durationDays: r.duration_days,
    endsAt: r.ends_at,
    repeatHours: Number(r.repeat_hours) || 0,
    version: r.updated_at,
  };
}

export const getPromo = cache(readPromo);

/** What visitors may see: on, has something to say, not already over */
export async function getActivePromo(): Promise<Promo | null> {
  const p = await getPromo();
  if (!p.enabled || (!p.title && !p.message)) return null;
  if (p.endsAt && Date.parse(p.endsAt) <= Date.now()) return null;
  return p;
}

async function uploadPromoImage(dataUrl: string): Promise<string | null> {
  const m = /^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length === 0 || bytes.length > 1_000_000) return null;
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const path = `promo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storage = createAdminClient().storage.from(CATALOG_BUCKET);
  const { error } = await storage.upload(path, bytes, {
    contentType: `image/${m[1]}`,
    cacheControl: "31536000",
  });
  if (error) {
    console.error("[uploadPromoImage]", error.message);
    return null;
  }
  return storage.getPublicUrl(path).data.publicUrl;
}

/** Only ever deletes files inside promo/, never product or service photos */
async function removePromoImage(url: string) {
  const path = catalogPathFromUrl(url);
  if (!path || !path.startsWith("promo/")) return;
  const { error } = await createAdminClient()
    .storage.from(CATALOG_BUCKET)
    .remove([path]);
  if (error) console.error("[removePromoImage]", error.message);
}

export async function savePromoRecord(input: PromoInput): Promise<Result> {
  const db = createAdminClient();
  const { data: current } = await db
    .from("site_promo")
    .select("image_url")
    .maybeSingle();
  const oldImage = ((current as { image_url?: string | null } | null)
    ?.image_url ?? "") as string;

  let image = "";
  if (input.image.startsWith("data:")) {
    const url = await uploadPromoImage(input.image);
    if (!url)
      return {
        ok: false,
        error: "Could not upload the picture. Try a smaller PNG, JPG or WebP.",
      };
    image = url;
  } else if (input.image) {
    if (!isCatalogImageUrl(input.image))
      return {
        ok: false,
        error:
          "Please upload the picture with the button instead of pasting a link.",
      };
    image = input.image;
  }

  const start = input.startsAt ? new Date(input.startsAt) : new Date();
  const end = input.durationDays
    ? new Date(start.getTime() + input.durationDays * 86_400_000)
    : null;
  const { error } = await db.from("site_promo").upsert({
    id: true,
    enabled: input.enabled,
    style: input.style,
    title: input.title,
    message: input.message,
    button_label: input.buttonLabel,
    button_url: input.buttonUrl,
    image_url: image,
    starts_at: start.toISOString(),
    duration_days: input.durationDays,
    ends_at: end ? end.toISOString() : null,
    repeat_hours: input.repeatHours,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[savePromoRecord]", error.code, error.message);
    if (image && image !== oldImage) await removePromoImage(image); // don't leave an orphan upload
    return { ok: false, error: "Could not save the promotion." };
  }
  if (oldImage && oldImage !== image) await removePromoImage(oldImage);
  return { ok: true };
}
