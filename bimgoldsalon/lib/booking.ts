import {
  BOOKING_WINDOW_DAYS,
  MIN_LEAD_MIN,
  openingHours,
  SLOT_STEP,
} from "@/lib/salon";
import type { Service } from "@/lib/services";

const pad = (n: number) => String(n).padStart(2, "0");

export type Availability = { dates: string[]; slots: Record<string, number[]> };
export type Busy = { start: number; end: number; serviceIds: number[] };
/** How many clients can be served at once: salon-wide, and per service */
export type Limits = { overall: number; perService: Record<number, number> };

/* ---------- dates (as "YYYY-MM-DD") ---------- */
export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromISODate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const isISODate = (s: unknown): s is string =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  toISODate(fromISODate(s)) === s;

export const SALON_TZ = "Europe/London";

/** Today's date and time on the salon's clock (not the server's or the visitor's) */
export const salonToday = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SALON_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "0";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
};

/** The days that can be booked, starting from today */
export const dateWindow = (todayISO: string = salonToday().date): string[] => {
  const [y, m, d] = todayISO.split("-").map(Number);
  return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) =>
    toISODate(new Date(y, m - 1, d + i)),
  );
};

/** "Wednesday 30 September" */
export const formatLongDate = (iso: string) =>
  fromISODate(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

/** for the date chips: Wed / 30 / Sep */
export const dayParts = (iso: string) => {
  const d = fromISODate(iso);
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "short" }),
    day: d.getDate(),
    month: d.toLocaleDateString("en-GB", { month: "short" }),
  };
};

/* ---------- times (minutes from midnight) ---------- */
export const formatTime = (min: number) => {
  const h24 = Math.floor(min / 60);
  return `${h24 % 12 || 12}:${pad(min % 60)} ${h24 >= 12 ? "PM" : "AM"}`;
};

/** "10:00-11:30 AM", or "11:30 AM-1:00 PM" when it crosses noon */
export const formatRange = (start: number, end: number) => {
  const s = formatTime(start);
  const e = formatTime(end);
  return s.endsWith(e.slice(-2)) ? `${s.slice(0, -3)}-${e}` : `${s}-${e}`;
};

/** 90 -> "1 hr, 30 min" */
export const formatDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h && `${h} hr`, m && `${m} min`].filter(Boolean).join(", ");
};

export const formatGBP = (n: number) =>
  Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`;

/* ---------- availability ---------- */
/** Start times that fit the opening hours, step and lead time (ignoring other bookings) */
export const candidateSlots = (
  iso: string,
  durationMin: number,
  today = salonToday(),
): number[] => {
  const hours = openingHours[fromISODate(iso).getDay()];
  if (!hours || durationMin <= 0) return [];
  const isToday = iso === today.date;
  const out: number[] = [];
  for (let t = hours.open; t + durationMin <= hours.close; t += SLOT_STEP) {
    if (isToday && t < today.minutes + MIN_LEAD_MIN) continue;
    out.push(t);
  }
  return out;
};

/**
 * Candidate slots minus any that are full: either the salon as a whole is at
 * its limit, or one of the chosen services is already at its own limit.
 */
export const freeSlots = (
  iso: string,
  durationMin: number,
  busy: Busy[],
  serviceIds: number[],
  limits: Limits,
  today = salonToday(),
): number[] =>
  candidateSlots(iso, durationMin, today).filter((t) => {
    const overlapping = busy.filter(
      (b) => t < b.end && t + durationMin > b.start,
    );
    if (overlapping.length >= limits.overall) return false;
    return serviceIds.every(
      (id) =>
        overlapping.filter((b) => b.serviceIds.includes(id)).length <
        (limits.perService[id] ?? 1),
    );
  });
/* ---------- services ---------- */
export const servicesByIds = (catalog: Service[], ids: string[]): Service[] =>
  catalog.filter((s) => ids.includes(s.id));

export const totalsFor = (list: Service[]) => ({
  duration: list.reduce((n, s) => n + s.durationMin, 0),
  price: list.reduce((n, s) => n + s.fromPrice, 0),
});

/** Same sum the database does: each service's deposit, rounded to pence */
export const depositFor = (list: Service[]) =>
  list.reduce((n, s) => n + Math.round(s.fromPrice * s.depositPercent), 0) /
  100;

/** "09:30" -> 570 */
export const parseHHMM = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Minutes from now (salon clock) until a booking starts. Negative once it has started. */
export const minutesUntil = (
  iso: string,
  startMin: number,
  today = salonToday(),
) => {
  const [y1, m1, d1] = today.date.split("-").map(Number);
  const [y2, m2, d2] = iso.split("-").map(Number);
  const days = Math.round(
    (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000,
  );
  return days * 1440 + startMin - today.minutes;
};
