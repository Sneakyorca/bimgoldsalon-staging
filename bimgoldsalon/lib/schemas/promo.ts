import { z } from "zod";

export const PROMO_DURATIONS = [
  { days: null, label: "Until I switch it off" },
  { days: 1, label: "1 day" },
  { days: 3, label: "3 days" },
  { days: 7, label: "1 week" },
  { days: 14, label: "2 weeks" },
  { days: 30, label: "30 days" },
] as const;

export const PROMO_REPEAT_OPTIONS = [
  { hours: 0, label: "On their next visit" },
  { hours: 12, label: "After 12 hours" },
  { hours: 24, label: "After 1 day" },
  { hours: 72, label: "After 3 days" },
  { hours: 168, label: "After 1 week" },
] as const;

const link = z
  .string()
  .trim()
  .max(300, "The button link is too long.")
  .refine(
    (v) =>
      v === "" ||
      (v.startsWith("/") && !v.startsWith("//")) ||
      /^https:\/\/\S+$/.test(v),
    "Use a page on this site (like /booking) or a full https:// link.",
  );

export const promoSchema = z
  .object({
    enabled: z.boolean(),
    style: z.enum(["popup", "banner"]),
    title: z
      .string()
      .trim()
      .max(80, "The title is too long (80 characters max)."),
    message: z
      .string()
      .trim()
      .max(240, "The message is too long (240 characters max)."),
    buttonLabel: z
      .string()
      .trim()
      .max(30, "The button text is too long (30 characters max)."),
    buttonUrl: link,
    startsAt: z.string().nullable(),
    durationDays: z.number().int().min(1).max(365).nullable(),
    repeatHours: z.number().int().min(0).max(720),
  })
  .refine(
    (v) => !v.enabled || v.title !== "" || v.message !== "",
    "Add a title or a message before switching the promotion on.",
  )
  .refine(
    (v) => (v.buttonLabel === "") === (v.buttonUrl === ""),
    "Fill in both the button text and the button link, or leave both empty.",
  )
  .refine(
    (v) => !v.startsAt || !Number.isNaN(Date.parse(v.startsAt)),
    "That start time isn't valid.",
  );

export type PromoInput = z.infer<typeof promoSchema>;
