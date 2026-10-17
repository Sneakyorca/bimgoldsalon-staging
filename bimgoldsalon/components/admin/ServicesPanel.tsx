"use client";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { removeService } from "@/app/admin/actions";
import { formatDuration } from "@/lib/booking";
import { formatPrice } from "@/lib/format";
import { serviceDeposit, type AdminService } from "@/lib/services";
import AdminDialog from "./AdminDialog";
import ConfirmButton from "./ConfirmButton";
import ServiceForm from "./ServiceForm";

const field =
  "rounded border border-border bg-white px-3 py-2 text-base focus:border-primary focus:outline-none md:text-sm";

export default function ServicesPanel({
  services,
}: {
  services: AdminService[];
}) {
  const [editing, setEditing] = useState<AdminService | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => [...new Set(services.map((s) => s.category).filter(Boolean))].sort(),
    [services],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter(
      (s) =>
        (!q || s.name.toLowerCase().includes(q)) &&
        (category === "all" || s.category === category),
    );
  }, [services, query, category]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services…"
            aria-label="Search services"
            className={field}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className={field}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90"
        >
          <Plus className="size-4" /> Add service
        </button>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Showing {filtered.length} of {services.length} services
      </p>

      <div className="mt-2 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f3] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3 text-right">At once</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Deposit</th>
              <th className="px-4 py-3">Homepage</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No services match those filters.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.image}
                        alt=""
                        className="size-10 rounded object-cover"
                      />
                    ) : (
                      <div className="size-10 rounded bg-[#ebebeb]" />
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-3 font-medium">
                    <span className="line-clamp-2" title={s.name}>
                      {s.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.category}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {s.durationLabel || formatDuration(s.durationMin)}
                  </td>
                  <td className="px-4 py-3 text-right">{s.capacity}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                    {formatPrice(s.price)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {formatPrice(serviceDeposit(s.price, s.depositPercent))}
                    <span className="block text-[11px] text-muted-foreground">
                      {s.depositPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.featured ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase text-emerald-700">
                        Featured
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${s.name}`}
                        onClick={() => setEditing(s)}
                        className="rounded border border-border p-1.5 text-muted-foreground hover:bg-primary hover:text-white"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <ConfirmButton
                        label={`Delete ${s.name}`}
                        action={() => removeService(s.id)}
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

      <AdminDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add service" : "Edit service"}
      >
        {editing && (
          <ServiceForm
            initialService={editing === "new" ? null : editing}
            categories={categories}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        )}
      </AdminDialog>
    </div>
  );
}
