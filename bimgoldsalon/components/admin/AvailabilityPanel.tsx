"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { blockDate, unblockDate } from "@/app/admin/actions";
import { formatLongDate, salonToday } from "@/lib/booking";
import ConfirmButton from "./ConfirmButton";

type Row = { id: string; date: string; reason: string };

export default function AvailabilityPanel({ dates }: { dates: Row[] }) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const today = salonToday().date;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!date) return;
    startTransition(async () => {
      try {
        const res = await blockDate(date, reason);
        if (!res.ok) setError(res.error);
        else {
          setDate("");
          setReason("");
        }
      } catch {
        setError("That didn't work. Please refresh the page and try again.");
      }
    });
  };

  return (
    <div>
      <form
        onSubmit={add}
        className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-white p-4"
      >
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Date
          </span>
          <input
            required
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block rounded border border-border px-3 py-2 text-base focus:border-primary focus:outline-none md:text-sm"
          />
        </label>
        <label className="block min-w-[180px] flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Reason (optional)
          </span>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={120}
            placeholder="e.g. Bank holiday, closed for training"
            className="mt-1 w-full rounded border border-border px-3 py-2 text-base focus:border-primary focus:outline-none md:text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Blocking…" : "Block date"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}
      <p className="mb-3 text-sm text-muted-foreground">
        Blocked days disappear from the booking page straight away. Bookings
        already made for that day are not cancelled, so check the Bookings tab.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f3] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dates.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No blocked dates. Everything is open for booking.
                </td>
              </tr>
            ) : (
              dates.map((r) => (
                <tr
                  key={r.id}
                  className={`border-t border-border ${r.date < today ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3 font-medium">
                    {formatLongDate(r.date)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.reason || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <ConfirmButton
                        label={`Make ${r.date} available again`}
                        action={() => unblockDate(r.id)}
                      >
                        <Trash2 className="size-4" />
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
