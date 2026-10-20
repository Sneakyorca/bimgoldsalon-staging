import "server-only";
import { cache } from "react";
import { DEFAULT_RULES, type DayHours, type SalonRules } from "@/lib/booking";

import type { SettingsInput } from "@/lib/schemas/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUSINESS } from "@/lib/business";

export type Result = { ok: true } | { ok: false; error: string };
export type SalonSettings = SalonRules & {
  /** Clients the salon can look after at once */
  capacity: number;
  cancellationHours: number;
};

const FALLBACK: SalonSettings = {
  ...DEFAULT_RULES,
  capacity: 2,
  cancellationHours: BUSINESS.cancellationHours,
};

const cleanHours = (v: unknown): DayHours[] => {
  if (!Array.isArray(v) || v.length !== 7) return FALLBACK.openingHours;
  return v.map((d): DayHours => {
    if (!d || typeof d !== "object") return null;
    const { open, close } = d as { open?: unknown; close?: unknown };
    return typeof open === "number" && typeof close === "number" && close > open
      ? { open, close }
      : null;
  });
};

export async function readSettings(): Promise<SalonSettings> {
  const { data, error } = await createAdminClient()
    .from("salon_settings")
    .select(
      "booking_capacity, opening_hours, cancellation_hours, slot_step_min, min_lead_min, booking_window_days",
    )
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("[readSettings]", error.code, error.message);
    return FALLBACK;
  }
  return {
    capacity: Number(data.booking_capacity) || FALLBACK.capacity,
    openingHours: cleanHours(data.opening_hours),
    cancellationHours: Number(
      data.cancellation_hours ?? FALLBACK.cancellationHours,
    ),
    slotStep: Number(data.slot_step_min) || FALLBACK.slotStep,
    minLeadMin: Number(data.min_lead_min ?? FALLBACK.minLeadMin),
    windowDays: Number(data.booking_window_days) || FALLBACK.windowDays,
  };
}

/** Read once per request */
export const getSettings = cache(readSettings);

export async function saveSettingsRecord(
  input: SettingsInput,
): Promise<Result> {
  const { error } = await createAdminClient()
    .from("salon_settings")
    .update({
      booking_capacity: input.capacity,
      opening_hours: input.openingHours,
      cancellation_hours: input.cancellationHours,
      slot_step_min: input.slotStep,
      min_lead_min: input.minLeadMin,
      booking_window_days: input.windowDays,
    })
    .eq("id", true);
  if (error) {
    console.error("[saveSettingsRecord]", error.code, error.message);
    return { ok: false, error: "Could not save the settings." };
  }
  return { ok: true };
}
