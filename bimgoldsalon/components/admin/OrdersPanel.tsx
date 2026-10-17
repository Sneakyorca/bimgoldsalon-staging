"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { setOrderPayment, setOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/dummydata/accountData";
import { deliveryOptions } from "@/dummydata/deliveryData";
import type { OrderView } from "@/lib/auth/api";
import { countryName } from "@/lib/countries";
import { formatPrice } from "@/lib/format";

const TONE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  refunded: "bg-slate-200 text-slate-700",
};

const when = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  });

const field =
  "rounded border border-border bg-white px-3 py-2 text-base focus:border-primary focus:outline-none md:text-sm";
const pill =
  "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-primary";

export default function OrdersPanel({ orders }: { orders: OrderView[] }) {
  const [rows, setRows] = useState(orders);
  useEffect(() => {
    setRows(orders);
  }, [orders]);

  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const open = rows.find((o) => o.id === openId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    return rows.filter((o) => {
      if (statusFilter !== "all" && o.orderStatus !== statusFilter)
        return false;
      if (!q) return true;
      return (
        o.id === q ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  // Update the screen straight away, put it back (and say why) if saving fails
  const save = (
    id: string,
    change: Partial<OrderView>,
    task: () => Promise<{ ok: true } | { ok: false; error: string }>,
  ) => {
    const before = rows;
    setError("");
    setRows((cur) => cur.map((o) => (o.id === id ? { ...o, ...change } : o)));
    startTransition(async () => {
      try {
        const res = await task();
        if (!res.ok) {
          setRows(before);
          setError(res.error);
        }
      } catch {
        setRows(before);
        setError("That didn't save. Please try again.");
      }
    });
  };

  const changeStatus = (id: string, status: OrderView["orderStatus"]) =>
    save(id, { orderStatus: status }, () => setOrderStatus(id, status));
  const changePayment = (id: string, status: OrderView["paymentStatus"]) =>
    save(id, { paymentStatus: status }, () => setOrderPayment(id, status));

  const StatusSelect = ({
    value,
    options,
    label,
    onChange,
  }: {
    value: string;
    options: readonly string[];
    label: string;
    onChange: (v: string) => void;
  }) => (
    <select
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      className={`${pill} ${TONE[value] ?? "bg-muted"}`}
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-white text-foreground">
          {o}
        </option>
      ))}
    </select>
  );

  if (open) {
    const option = deliveryOptions.find((d) => d.id === open.deliveryMethod);
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          ← Back to orders
        </button>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="mt-4 rounded-lg border border-border bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Order #{open.id} · {when(open.createdAt)}
          </p>
          <p className="mt-1 text-2xl font-semibold">{open.customerName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            <a href={`mailto:${open.customerEmail}`} className="underline">
              {open.customerEmail}
            </a>{" "}
            ·{" "}
            <a href={`tel:${open.customerPhone}`} className="underline">
              {open.customerPhone}
            </a>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {option?.label ?? "Delivery"}
            {open.deliveryMethod === "pickup"
              ? ` (collect from ${option?.address})`
              : `: ${open.address}, ${open.city}${open.state ? `, ${open.state}` : ""}, ${open.postcode}, ${countryName(open.country ?? "GB")}`}
          </p>
          {open.notes && (
            <p className="mt-1 text-sm text-muted-foreground">
              Notes: {open.notes}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <StatusSelect
              value={open.orderStatus}
              options={ORDER_STATUSES}
              label="Order status"
              onChange={(v) =>
                changeStatus(open.id, v as OrderView["orderStatus"])
              }
            />
            <StatusSelect
              value={open.paymentStatus}
              options={PAYMENT_STATUSES}
              label="Payment status"
              onChange={(v) =>
                changePayment(open.id, v as OrderView["paymentStatus"])
              }
            />
          </div>

          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {open.items.map((it, i) => (
                <tr
                  key={`${it.productId}-${i}`}
                  className="border-b border-border/50"
                >
                  <td className="py-2">{it.name}</td>
                  <td className="py-2 text-right">{it.quantity}</td>
                  <td className="py-2 text-right">
                    {formatPrice(it.price * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={2}
                  className="pt-3 text-right text-muted-foreground"
                >
                  Subtotal
                </td>
                <td className="pt-3 text-right">
                  {formatPrice(open.subtotal ?? open.total)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="text-right text-muted-foreground">
                  Delivery
                </td>
                <td className="text-right">
                  {formatPrice(open.deliveryFee ?? 0)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="py-2 text-right font-semibold">
                  Total
                </td>
                <td className="py-2 text-right text-lg font-semibold text-primary">
                  {formatPrice(open.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or order #…"
          aria-label="Search orders"
          className={field}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className={field}
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f3] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No orders match those filters.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setOpenId(o.id)}
                  className="cursor-pointer border-t border-border hover:bg-[#f7f5f3]"
                >
                  <td className="px-4 py-3 font-medium">#{o.id}</td>
                  <td className="px-4 py-3">
                    {o.customerName}
                    <span className="block text-[12px] text-muted-foreground">
                      {o.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {when(o.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatPrice(o.total)}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusSelect
                      value={o.orderStatus}
                      options={ORDER_STATUSES}
                      label={`Status for order ${o.id}`}
                      onChange={(v) =>
                        changeStatus(o.id, v as OrderView["orderStatus"])
                      }
                    />
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusSelect
                      value={o.paymentStatus}
                      options={PAYMENT_STATUSES}
                      label={`Payment for order ${o.id}`}
                      onChange={(v) =>
                        changePayment(o.id, v as OrderView["paymentStatus"])
                      }
                    />
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
