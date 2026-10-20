"use client";
import { useEffect, useState } from "react";
import { getAnalyticsAction } from "@/app/admin/actions";
import { Skeleton } from "@/components/ui/Skeleton";
import { RANGES, type Analytics, type RangeId } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";

const Kpi = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-lg border border-border bg-white p-4">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
    {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

function RevenueChart({ series }: { series: Analytics["series"] }) {
  const max = Math.max(1, ...series.map((s) => s.products + s.deposits));
  const every = Math.ceil(series.length / 8);
  return (
    <div>
      <div
        className="flex h-56 items-end gap-1"
        role="img"
        aria-label="Revenue over time"
      >
        {series.map((s) => (
          <div
            key={s.label}
            className="flex h-full flex-1 flex-col justify-end transition-opacity hover:opacity-70"
            title={`${s.label}: ${formatPrice(s.products + s.deposits)} (shop ${formatPrice(s.products)}, deposits ${formatPrice(s.deposits)})`}
          >
            <div
              className="bg-amber-400"
              style={{ height: `${(s.deposits / max) * 100}%` }}
            />
            <div
              className="bg-primary"
              style={{ height: `${(s.products / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1 text-[10px] text-muted-foreground">
        {series.map((s, i) => (
          <div key={s.label} className="flex-1 truncate text-center">
            {i % every === 0 ? s.label : ""}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-primary" /> Shop orders
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-amber-400" /> Booking deposits
        </span>
      </div>
    </div>
  );
}

function Ranked({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { name: string; main: string; sub: string; share: number }[];
  empty: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <h3 className="font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((r) => (
            <li key={r.name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium" title={r.name}>
                  {r.name}
                </span>
                <span className="shrink-0">
                  {r.main}{" "}
                  <span className="text-xs text-muted-foreground">{r.sub}</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(3, r.share * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AnalyticsPanel() {
  const [range, setRange] = useState<RangeId>("30d");
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getAnalyticsAction(range)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) setData(res.data);
        else setError(res.error);
      })
      .catch(() => {
        if (!cancelled)
          setError("Couldn't load the numbers. Please refresh the page.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const maxProduct = Math.max(
    1,
    ...(data?.topProducts.map((p) => p.revenue) ?? [1]),
  );
  const maxService = Math.max(
    1,
    ...(data?.topServices.map((s) => s.bookings) ?? [1]),
  );
  const maxDay = Math.max(1, ...(data?.weekdays.map((d) => d.count) ?? [1]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Overview</h2>
        <div className="flex rounded-full border border-border bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              aria-pressed={range === r.id}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${range === r.id ? "bg-primary text-white" : "text-muted-foreground"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!data ? (
        <div aria-busy="true" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-lg" />
        </div>
      ) : (
        <div
          className={
            loading
              ? "space-y-6 opacity-60 transition-opacity"
              : "space-y-6 transition-opacity"
          }
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi
              label="Revenue"
              value={formatPrice(data.kpis.revenue)}
              hint={`Shop ${formatPrice(data.kpis.productRevenue)} · deposits ${formatPrice(data.kpis.depositRevenue)}`}
            />
            <Kpi
              label="Paid orders"
              value={String(data.kpis.orders)}
              hint={`Average ${formatPrice(data.kpis.avgOrder)}`}
            />
            <Kpi label="Bookings" value={String(data.kpis.bookings)} />
            <Kpi
              label="Cancelled bookings"
              value={String(data.kpis.cancelledBookings)}
            />
          </div>

          <section className="rounded-lg border border-border bg-white p-5">
            <h3 className="mb-4 font-semibold">Revenue over time</h3>
            <RevenueChart series={data.series} />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Ranked
              title="Top products"
              empty="No paid orders in this period."
              rows={data.topProducts.map((p) => ({
                name: p.name,
                main: formatPrice(p.revenue),
                sub: `${p.units} sold`,
                share: p.revenue / maxProduct,
              }))}
            />
            <Ranked
              title="Top services"
              empty="No bookings in this period."
              rows={data.topServices.map((s) => ({
                name: s.name,
                main: `${s.bookings} booked`,
                sub: formatPrice(s.value),
                share: s.bookings / maxService,
              }))}
            />
          </div>

          <section className="rounded-lg border border-border bg-white p-5">
            <h3 className="mb-4 font-semibold">Busiest booking days</h3>
            <div className="flex h-32 items-end gap-3">
              {data.weekdays.map((d) => (
                <div
                  key={d.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  title={`${d.label}: ${d.count} bookings`}
                >
                  <span className="text-xs text-muted-foreground">
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t bg-primary/80"
                    style={{
                      height: `${(d.count / maxDay) * 80}%`,
                      minHeight: d.count ? 4 : 0,
                    }}
                  />
                  <span className="text-xs font-medium">{d.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
