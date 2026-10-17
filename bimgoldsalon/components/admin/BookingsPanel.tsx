"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { X } from "lucide-react";
import {
  setBookingNotes,
  setBookingPaid,
  setBookingStatus,
} from "@/app/admin/actions";
import { BOOKING_STATUSES } from "@/dummydata/accountData";
import type { BookingView } from "@/lib/auth/api";
import {
  formatDuration,
  formatTime,
  fromISODate,
  parseHHMM,
  salonToday,
  toISODate,
} from "@/lib/booking";
import { formatPrice } from "@/lib/format";

type Status = BookingView["status"];

const TONE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  payment_failed: "bg-rose-100 text-rose-700",
};

const shortDate = (iso: string) =>
  fromISODate(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const clock = (hhmm: string) => formatTime(parseHHMM(hhmm));
/** What's still owed at the salon: the total, less the deposit once it's paid */
const balanceOf = (b: BookingView) =>
  Math.max(0, b.price - (b.isPaid ? b.depositAmount : 0));

const field =
  "rounded border border-border bg-white px-3 py-2 text-base focus:border-primary focus:outline-none md:text-sm";

export default function BookingsPanel({
  bookings,
}: {
  bookings: BookingView[];
}) {
  const [rows, setRows] = useState(bookings);
  useEffect(() => {
    setRows(bookings);
  }, [bookings]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"table" | "calendar">("table");
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const selected = rows.find((b) => b.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.customerPhone.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  const patch = (id: string, change: Partial<BookingView>) =>
    setRows((cur) => cur.map((b) => (b.id === id ? { ...b, ...change } : b)));

  // Update the screen straight away, put it back if saving fails
  const save = (
    id: string,
    change: Partial<BookingView>,
    task: () => Promise<void>,
  ) => {
    const before = rows;
    setError("");
    patch(id, change);
    startTransition(async () => {
      try {
        await task();
      } catch {
        setRows(before);
        setError("That didn't save. Please try again.");
      }
    });
  };

  const changeStatus = (id: string, status: Status) =>
    save(id, { status }, () => setBookingStatus(id, status));
  const togglePaid = (b: BookingView) =>
    save(b.id, { isPaid: !b.isPaid }, () => setBookingPaid(b.id, !b.isPaid));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer or service…"
            aria-label="Search bookings"
            className={field}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className={field}
          >
            <option value="all">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex rounded-full border border-border bg-white p-1">
          {(["table", "calendar"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition ${
                view === v ? "bg-primary text-white" : "text-muted-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {view === "calendar" ? (
        <CalendarView
          bookings={filtered}
          onSelect={(b) => setSelectedId(b.id)}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f5f3] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Deposit</th>
                <th className="px-4 py-3 text-right">Balance due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No bookings match those filters.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className={`cursor-pointer border-t border-border ${
                      selectedId === b.id
                        ? "bg-primary/5"
                        : "hover:bg-[#f7f5f3]"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {b.customerName}
                      <span className="block text-[12px] font-normal text-muted-foreground">
                        {b.customerPhone}
                      </span>
                    </td>
                    <td className="max-w-[240px] px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-2" title={b.serviceName}>
                        {b.serviceName}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {shortDate(b.date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {clock(b.time)}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={b.status}
                        aria-label={`Status for ${b.customerName}`}
                        onChange={(e) =>
                          changeStatus(b.id, e.target.value as Status)
                        }
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-primary ${TONE[b.status] ?? "bg-muted"}`}
                      >
                        {BOOKING_STATUSES.map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="bg-white text-foreground"
                          >
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => togglePaid(b)}
                        aria-pressed={b.isPaid}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          b.isPaid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {b.isPaid ? "Paid" : "Unpaid"}{" "}
                        {formatPrice(b.depositAmount)}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {balanceOf(b) > 0 ? (
                        <span className="font-semibold text-amber-700">
                          {formatPrice(balanceOf(b))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">£0.00</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Drawer
          key={selected.id}
          booking={selected}
          onClose={() => setSelectedId(null)}
          onSaveNotes={(notes) =>
            save(selected.id, { notes }, () =>
              setBookingNotes(selected.id, notes),
            )
          }
        />
      )}
    </div>
  );
}

function CalendarView({
  bookings,
  onSelect,
}: {
  bookings: BookingView[];
  onSelect: (b: BookingView) => void;
}) {
  const [offset, setOffset] = useState(0);

  const base = fromISODate(salonToday().date);
  base.setDate(1);
  base.setMonth(base.getMonth() + offset);
  const year = base.getFullYear();
  const month = base.getMonth();
  // weeks start on Monday
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();

  const byDate = new Map<string, BookingView[]>();
  for (const b of bookings) {
    const list = byDate.get(b.date) ?? [];
    list.push(b);
    byDate.set(b.date, list);
  }
  for (const list of byDate.values())
    list.sort((a, b) => a.time.localeCompare(b.time));

  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const nav = "rounded border border-border px-3 py-1.5 text-sm hover:bg-muted";

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffset((o) => o - 1)}
          className={nav}
        >
          ← Prev
        </button>
        <p className="font-semibold">
          {base.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => setOffset((o) => o + 1)}
          className={nav}
        >
          Next →
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null)
                return <div key={`gap-${i}`} className="min-h-[84px]" />;
              const iso = toISODate(new Date(year, month, day));
              const list = byDate.get(iso) ?? [];
              return (
                <div
                  key={iso}
                  className="min-h-[84px] rounded border border-border p-1"
                >
                  <p className="text-[11px] text-muted-foreground">{day}</p>
                  <div className="mt-1 space-y-1">
                    {list.slice(0, 3).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onSelect(b)}
                        title={`${clock(b.time)} · ${b.customerName} · ${b.serviceName}`}
                        className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium ${
                          TONE[b.status] ?? "bg-muted"
                        } ${b.status === "cancelled" ? "line-through opacity-60" : ""}`}
                      >
                        {clock(b.time)} {b.customerName}
                      </button>
                    ))}
                    {list.length > 3 && (
                      <p className="text-[10px] text-muted-foreground">
                        +{list.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Drawer({
  booking,
  onClose,
  onSaveNotes,
}: {
  booking: BookingView;
  onClose: () => void;
  onSaveNotes: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(booking.notes);
  const end = parseHHMM(booking.time) + booking.durationMin;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose}>
      <aside
        role="dialog"
        aria-label="Booking details"
        onClick={(e) => e.stopPropagation()}
        className="ml-auto h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Booking details</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 border-b border-border pb-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {shortDate(booking.date)} · {clock(booking.time)}–
              {formatTime(end % 1440)}
            </p>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TONE[booking.status] ?? "bg-muted"}`}
            >
              {booking.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-base font-semibold">{booking.customerName}</p>
          <p className="text-sm">
            <a
              href={`tel:${booking.customerPhone.replace(/\s/g, "")}`}
              className="text-primary underline"
            >
              {booking.customerPhone}
            </a>
          </p>
          <p className="text-sm">
            <a
              href={`mailto:${booking.customerEmail}`}
              className="text-primary underline"
            >
              {booking.customerEmail}
            </a>
          </p>
        </div>

        <dl className="mt-4 space-y-2 border-b border-border pb-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Services</dt>
            <dd className="text-right font-medium">{booking.serviceName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Duration</dt>
            <dd className="font-medium">
              {formatDuration(booking.durationMin)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-medium">{formatPrice(booking.price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Deposit ({booking.isPaid ? "paid" : "unpaid"})
            </dt>
            <dd className="font-medium">
              {formatPrice(booking.depositAmount)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Balance due at the salon</dt>
            <dd className="font-medium">{formatPrice(balanceOf(booking))}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <label htmlFor="booking-notes" className="text-sm font-semibold">
            Notes
          </label>
          <textarea
            id="booking-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Internal notes about this booking…"
            className="mt-2 w-full rounded border border-border px-3 py-2 text-base focus:border-primary focus:outline-none md:text-sm"
          />
          <button
            type="button"
            onClick={() => onSaveNotes(notes)}
            disabled={notes === booking.notes}
            className="mt-2 rounded-full bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90 disabled:opacity-40"
          >
            Save notes
          </button>
        </div>
      </aside>
    </div>
  );
}
