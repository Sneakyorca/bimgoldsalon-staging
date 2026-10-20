import type { DayHours } from "@/lib/booking";

const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK = [1, 2, 3, 4, 5, 6, 0]; // Monday first

const clock = (min: number) => {
  const h24 = Math.floor(min / 60);
  const m = String(min % 60).padStart(2, "0");
  return `${h24 % 12 || 12}:${m} ${h24 >= 12 ? "pm" : "am"}`;
};

export type HoursLine = { days: string; time: string; closed: boolean };

/** Groups days with the same hours: "Mon – Sat: 9:00 am – 7:30 pm", "Sun: Closed" */
export function hoursSummary(hours: DayHours[]): HoursLine[] {
  const groups: {
    first: number;
    last: number;
    key: string;
    time: string;
    closed: boolean;
  }[] = [];

  WEEK.forEach((day, i) => {
    const h = hours[day];
    const key = h ? `${h.open}-${h.close}` : "closed";
    const prev = groups[groups.length - 1];
    if (prev && prev.key === key && prev.last === i - 1) prev.last = i;
    else
      groups.push({
        first: i,
        last: i,
        key,
        time: h ? `${clock(h.open)} – ${clock(h.close)}` : "Closed",
        closed: !h,
      });
  });

  return groups.map((g) => ({
    days:
      g.first === g.last
        ? SHORT[WEEK[g.first]]
        : `${SHORT[WEEK[g.first]]} – ${SHORT[WEEK[g.last]]}`,
    time: g.time,
    closed: g.closed,
  }));
}
