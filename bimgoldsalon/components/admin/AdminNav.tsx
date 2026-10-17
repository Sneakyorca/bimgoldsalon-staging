"use client";
import {
  CalendarOff,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Package,
  Scissors,
  ShoppingCart,
  Users,
} from "lucide-react";
const items = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "bookings", label: "Bookings", icon: ClipboardList },
  { id: "availability", label: "Availability", icon: CalendarOff },
  { id: "waitlist", label: "Waitlist", icon: ListChecks },
  { id: "customers", label: "Customers", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "services", label: "Services", icon: Scissors },
] as const;
export type AdminSection = (typeof items)[number]["id"];
export default function AdminNav({
  value,
  onChange,
}: {
  value: AdminSection;
  onChange: (value: AdminSection) => void;
}) {
  return (
    <nav
      aria-label="Admin sections"
      className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible"
    >
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-current={value === id ? "page" : undefined}
          onClick={() => onChange(id)}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2 text-[15px] font-medium transition lg:border-transparent lg:py-3 lg:text-[16px] ${value === id ? "border-primary bg-primary text-white" : "border-black/60 hover:bg-card lg:border-transparent"}`}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          {label}
        </button>
      ))}
    </nav>
  );
}
