"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSettings } from "@/app/admin/actions";
import type { SalonSettings } from "@/Data/settings";
import { inputCls, labelCls } from "./shared";

const DAYS = [
  { i: 1, name: "Monday" },
  { i: 2, name: "Tuesday" },
  { i: 3, name: "Wednesday" },
  { i: 4, name: "Thursday" },
  { i: 5, name: "Friday" },
  { i: 6, name: "Saturday" },
  { i: 0, name: "Sunday" },
];

const toHHMM = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const toMin = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

export default function SettingsPanel({
  settings,
}: {
  settings: SalonSettings;
}) {
  const [days, setDays] = useState(
    settings.openingHours.map((h) => ({
      open: h !== null,
      from: toHHMM(h?.open ?? 540),
      to: toHHMM(h?.close ?? 1170),
    })),
  );
  const [capacity, setCapacity] = useState(String(settings.capacity));
  const [cancelHours, setCancelHours] = useState(
    String(settings.cancellationHours),
  );
  const [slotStep, setSlotStep] = useState(String(settings.slotStep));
  const [leadHours, setLeadHours] = useState(String(settings.minLeadMin / 60));
  const [windowDays, setWindowDays] = useState(String(settings.windowDays));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const setDay = (i: number, change: Partial<(typeof days)[number]>) =>
    setDays((cur) =>
      cur.map((d, idx) => (idx === i ? { ...d, ...change } : d)),
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (days.some((d) => d.open && (!d.from || !d.to)))
      return setError("Enter opening and closing times for each open day.");
    const nums = [capacity, cancelHours, leadHours, windowDays].map(Number);
    if (nums.some((n) => !Number.isFinite(n)))
      return setError("Please fill in every number.");

    startTransition(async () => {
      try {
        const res = await saveSettings({
          openingHours: days.map((d) =>
            d.open ? { open: toMin(d.from), close: toMin(d.to) } : null,
          ),
          capacity: Number(capacity),
          cancellationHours: Number(cancelHours),
          slotStep: Number(slotStep) as 15 | 30 | 60,
          minLeadMin: Math.round(Number(leadHours) * 60),
          windowDays: Number(windowDays),
        });
        if (res.ok) toast.success("Settings saved");
        else setError(res.error);
      } catch {
        setError("That didn't save. Please refresh the page and try again.");
      }
    });
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-semibold">Opening hours</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Customers can only book inside these hours. Untick a day to close it.
        </p>
        <ul className="mt-4 space-y-3">
          {DAYS.map(({ i, name }) => (
            <li key={i} className="flex flex-wrap items-center gap-3">
              <label className="flex w-36 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={days[i].open}
                  onChange={(e) => setDay(i, { open: e.target.checked })}
                  className="size-4 accent-primary"
                />
                {name}
              </label>
              {days[i].open ? (
                <>
                  <input
                    type="time"
                    aria-label={`${name} opens`}
                    value={days[i].from}
                    onChange={(e) => setDay(i, { from: e.target.value })}
                    className={`${inputCls} w-32`}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <input
                    type="time"
                    aria-label={`${name} closes`}
                    value={days[i].to}
                    onChange={(e) => setDay(i, { to: e.target.value })}
                    className={`${inputCls} w-32`}
                  />
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Closed</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-semibold">Booking rules</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Clients at the same time</span>
            <input
              type="number"
              min="1"
              max="20"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className={inputCls}
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Salon-wide, across all services (you have 2 stylists).
            </span>
          </label>
          <label className="block">
            <span className={labelCls}>Free cancellation (hours before)</span>
            <input
              type="number"
              min="0"
              max="168"
              value={cancelHours}
              onChange={(e) => setCancelHours(e.target.value)}
              className={inputCls}
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Customers can cancel online until this long before.
            </span>
          </label>
          <label className="block">
            <span className={labelCls}>Booking times every</span>
            <select
              value={slotStep}
              onChange={(e) => setSlotStep(e.target.value)}
              className={inputCls}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Minimum notice (hours)</span>
            <input
              type="number"
              min="0"
              max="48"
              step="0.5"
              value={leadHours}
              onChange={(e) => setLeadHours(e.target.value)}
              className={inputCls}
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Stops same-day bookings at the last minute.
            </span>
          </label>
          <label className="block">
            <span className={labelCls}>Book up to (days ahead)</span>
            <input
              type="number"
              min="7"
              max="90"
              value={windowDays}
              onChange={(e) => setWindowDays(e.target.value)}
              className={inputCls}
            />
          </label>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        The wording in the footer, the Terms page and the booking page policy is
        typed text, so update it too if you change hours or the cancellation
        window.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
