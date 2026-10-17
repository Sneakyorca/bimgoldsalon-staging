"use client";
import { useMemo, useState } from "react";
import type { BookingView, OrderView, PublicUser } from "@/lib/auth/api";
import { fromISODate } from "@/lib/booking";

const shortDate = (iso: string) =>
  fromISODate(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function CustomersPanel({
  customers,
  bookings,
  orders,
}: {
  customers: PublicUser[];
  bookings: BookingView[];
  orders: OrderView[];
}) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q),
      )
      .map((c) => {
        const mine = bookings.filter(
          (b) => b.userId === c.id && b.status !== "cancelled",
        );
        const last = mine
          .map((b) => b.date)
          .sort()
          .at(-1);
        return {
          ...c,
          visits: mine.length,
          lastBooking: last ?? null,
          orders: orders.filter((o) => o.userId === c.id).length,
        };
      });
  }, [customers, bookings, orders, query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search customers…"
        aria-label="Search customers"
        className="mb-4 rounded border border-border bg-white px-3 py-2 text-base focus:border-primary focus:outline-none md:text-sm"
      />
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f3] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Last booking</th>
              <th className="px-4 py-3 text-right">Bookings</th>
              <th className="px-4 py-3 text-right">Orders</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No customers yet.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{c.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <a href={`mailto:${c.email}`} className="underline">
                      {c.email}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="underline">
                        {c.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {c.lastBooking ? shortDate(c.lastBooking) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">{c.visits}</td>
                  <td className="px-4 py-3 text-right">{c.orders}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
