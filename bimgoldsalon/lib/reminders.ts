import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { siteUrl } from "@/lib/email/brand";

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return v !== undefined && v.trim() !== "" && Number.isFinite(n) && n >= 0
    ? n
    : fallback;
};

/**
 * Defaults live here. Every one can be overridden with an environment variable
 * (Netlify -> Environment variables), so you can test without changing code.
 */
export const reminderConfig = () => ({
  cart: {
    enabled: process.env.CART_REMINDER_ENABLED !== "false",
    firstAfterMin: num(process.env.CART_REMINDER_FIRST_MIN, 60), // quiet minutes before reminder 1
    secondAfterMin: num(process.env.CART_REMINDER_SECOND_MIN, 24 * 60), // after reminder 1; 0 = send only one
    maxAgeHours: 72, // ignore baskets older than this
    quiet:
      process.env.CART_REMINDER_QUIET === "off" ? null : { from: 21, to: 8 }, // UK time
    requirePurchase: process.env.CART_REMINDER_REQUIRE_PURCHASE !== "false",
    batch: 15,
  },
  booking: {
    enabled: process.env.BOOKING_REMINDER_ENABLED !== "false",
    hoursBefore: num(process.env.BOOKING_REMINDER_HOURS, 24), // how long before the appointment
    windowHours: 2, // catches it even if a run is missed
    batch: 30,
  },
  /** While testing: only handle this one email address */
  onlyEmail: (process.env.REMINDER_ONLY_EMAIL ?? "").trim().toLowerCase(),
});

export function inQuietHours(
  q: { from: number; to: number } | null,
  now = new Date(),
) {
  if (!q) return false;
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Europe/London",
    }).format(now),
  );
  return q.from > q.to
    ? hour >= q.from || hour < q.to
    : hour >= q.from && hour < q.to;
}

const secret = () => process.env.CRON_SECRET || "";
const sign = (userId: string) =>
  createHmac("sha256", secret()).update(`cart-unsub:${userId}`).digest("hex");

export const unsubscribeUrl = (userId: string) =>
  `${siteUrl()}/api/unsubscribe/cart?u=${userId}&t=${sign(userId)}`;

export function validUnsubscribeToken(userId: string, token: string) {
  if (!secret()) return false;
  const a = Buffer.from(sign(userId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
