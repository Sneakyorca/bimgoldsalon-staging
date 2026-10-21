"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarOff,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Package,
  Pencil,
  Scissors,
  Settings as SettingsIcon,
  ShoppingCart,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import type { AdminSnapshot } from "@/lib/auth/api";
import { salonToday } from "@/lib/booking";
import { LOW_STOCK_THRESHOLD, stockLevel } from "@/lib/products";
import type { AdminSection as BaseSection } from "./AdminNav";
import AnalyticsPanel from "./AnalyticsPanel";
import ApplicationsPanel from "./ApplicationsPanel";
import AvailabilityPanel from "./AvailabilityPanel";
import BookingsPanel from "./BookingsPanel";
import CustomersPanel from "./CustomersPanel";
import OrdersPanel from "./OrdersPanel";
import ProductsPanel, { type StockPreset } from "./ProductsPanel";
import ServicesPanel from "./ServicesPanel";
import SettingsPanel from "./SettingsPanel";
import WaitlistPanel from "./WaitlistPanel";

type AdminSection = BaseSection | "applications" | "settings";

const NAV: { id: AdminSection; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Analytics", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "bookings", label: "Bookings", icon: ClipboardList },
  { id: "availability", label: "Availability", icon: CalendarOff },
  { id: "waitlist", label: "Waitlist", icon: ListChecks },
  { id: "customers", label: "Customers", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "services", label: "Services", icon: Scissors },
  { id: "applications", label: "Applications", icon: GraduationCap },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

// Keeps the sidebar and sticky header clear of your fixed site navbar
const BELOW_NAVBAR = "top-20 md:top-24 lg:top-28";

const Badge = ({ n, title }: { n: number; title?: string }) => (
  <span
    className="ml-auto grid min-w-5 place-items-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-black"
    title={title}
  >
    {n}
  </span>
);

export default function AdminConsole({
  adminName,
  data,
}: {
  adminName: string;
  data: AdminSnapshot;
}) {
  const [section, setSection] = useState<AdminSection>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [stockPreset, setStockPreset] = useState<StockPreset>("all");

  // Products that are low or out of stock, lowest first
  const restock = data.products
    .filter((p) => stockLevel(p.stock) !== "in")
    .sort((a, b) => a.stock - b.stock);
  const outCount = restock.filter((p) => p.stock <= 0).length;
  const lowCount = restock.length - outCount;

  const today = salonToday().date;
  const newApplications = data.applications.filter(
    (a) => a.status === "new",
  ).length;
  const upcomingWaitlist = data.waitlist.filter(
    (w) => w.preferredDate > today,
  ).length;

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  useEffect(() => {
    const close = () => {
      if (window.innerWidth >= 1024) setNavOpen(false);
    };
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  const go = (id: AdminSection, preset: StockPreset = "all") => {
    setStockPreset(preset);
    setSection(id);
    setNavOpen(false);
  };

  const heading = NAV.find((n) => n.id === section)?.label ?? "Analytics";
  const summary = [
    outCount > 0 ? `${outCount} out of stock` : "",
    lowCount > 0
      ? `${lowCount} running low (${LOW_STOCK_THRESHOLD} or fewer)`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const badgeFor = (id: AdminSection) => {
    if (id === "products" && restock.length > 0)
      return <Badge n={restock.length} title={summary} />;
    if (id === "applications" && newApplications > 0)
      return <Badge n={newApplications} title="New applications" />;
    if (id === "waitlist" && upcomingWaitlist > 0)
      return <Badge n={upcomingWaitlist} title="People waiting for a day" />;
    return null;
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f5f5f5] text-foreground md:min-h-[calc(100vh-6rem)] lg:flex lg:min-h-[calc(100vh-7rem)]">
      {/* Sidebar: fixed drawer on mobile, sticky column on desktop */}
      <aside
        className={`fixed bottom-0 left-0 z-40 w-60 transform overflow-y-auto bg-primary text-white transition-transform duration-200 lg:sticky lg:bottom-auto lg:z-30 lg:h-[calc(100vh-7rem)] lg:shrink-0 lg:self-start lg:translate-x-0 ${BELOW_NAVBAR} ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-24 items-center justify-center border-b border-white/10 px-6">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em]">
              BIM - GOLD
            </p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">
              Hair &amp; Beauty Salon
            </p>
          </div>
        </div>
        <nav className="mt-6 px-3 pb-6" aria-label="Admin sections">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => go(item.id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-full px-5 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-white text-primary"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
                {badgeFor(item.id)}
              </button>
            );
          })}
        </nav>
      </aside>

      {navOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
          className={`fixed inset-x-0 bottom-0 z-30 bg-black/40 lg:hidden ${BELOW_NAVBAR}`}
        />
      )}

      <div className="min-w-0 flex-1">
        <header
          className={`sticky z-20 flex items-center gap-4 border-b border-border bg-white px-4 py-4 md:px-8 ${BELOW_NAVBAR}`}
        >
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={navOpen}
          >
            {navOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
          <h1 className="text-xl font-semibold md:text-2xl">{heading}</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {adminName}
            </span>
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-primary hover:text-white"
            >
              <Pencil className="size-3.5" />
              <span className="hidden sm:inline">Edit profile</span>
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </header>

        <div className="space-y-6 px-4 py-6 md:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Customers" value={data.customers.length} />
            <StatCard label="Bookings" value={data.bookings.length} />
            <StatCard label="Orders" value={data.orders.length} />
            <StatCard label="Pending" value={data.stats.pending} highlight />
          </div>

          {section === "overview" && (
            <div className="space-y-6">
              {restock.length > 0 && (
                <div
                  role="alert"
                  className="flex flex-wrap items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4"
                >
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-amber-900">
                      Stock needs attention: {summary}
                    </p>
                    <ul className="mt-1 space-y-0.5 text-sm text-amber-900/80">
                      {restock.slice(0, 5).map((p) => (
                        <li key={p.id} className="truncate">
                          {p.name} —{" "}
                          {p.stock <= 0 ? "out of stock" : `${p.stock} left`}
                        </li>
                      ))}
                      {restock.length > 5 && (
                        <li>and {restock.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => go("products", "restock")}
                    className="rounded-full bg-amber-600 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90"
                  >
                    Review stock
                  </button>
                </div>
              )}
              <AnalyticsPanel />
            </div>
          )}

          {section === "bookings" && <BookingsPanel bookings={data.bookings} />}
          {section === "products" && (
            <ProductsPanel
              key={stockPreset}
              products={data.products}
              initialStockFilter={stockPreset}
            />
          )}
          {section === "services" && <ServicesPanel services={data.services} />}
          {section === "applications" && (
            <ApplicationsPanel applications={data.applications} />
          )}
          {section === "orders" && <OrdersPanel orders={data.orders} />}
          {section === "customers" && (
            <CustomersPanel
              customers={data.customers}
              bookings={data.bookings}
              orders={data.orders}
            />
          )}
          {section === "availability" && (
            <AvailabilityPanel dates={data.blockedDates} />
          )}
          {section === "waitlist" && <WaitlistPanel entries={data.waitlist} />}
          {section === "settings" && <SettingsPanel settings={data.settings} />}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) => (
  <div
    className={`rounded-lg px-5 py-5 ${highlight ? "bg-amber-100" : "bg-[#e5eaee]"}`}
  >
    <p className="text-2xl font-bold md:text-3xl">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
  </div>
);
