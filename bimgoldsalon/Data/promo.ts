import "server-only";
import { cache } from "react";
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
      "enabled, style, title, message, button_label, button_url, starts_at, duration_days, ends_at, repeat_hours, updated_at",
    )
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("[readPromo]", error.code, error.message); // e.g. SQL not run yet
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

export async function savePromoRecord(input: PromoInput): Promise<Result> {
  const start = input.startsAt ? new Date(input.startsAt) : new Date();
  const end = input.durationDays
    ? new Date(start.getTime() + input.durationDays * 86_400_000)
    : null;
  const { error } = await createAdminClient()
    .from("site_promo")
    .upsert({
      id: true,
      enabled: input.enabled,
      style: input.style,
      title: input.title,
      message: input.message,
      button_label: input.buttonLabel,
      button_url: input.buttonUrl,
      starts_at: start.toISOString(),
      duration_days: input.durationDays,
      ends_at: end ? end.toISOString() : null,
      repeat_hours: input.repeatHours,
      updated_at: new Date().toISOString(),
    });
  if (error) {
    console.error("[savePromoRecord]", error.code, error.message);
    return { ok: false, error: "Could not save the promotion." };
  }
  return { ok: true };
}
