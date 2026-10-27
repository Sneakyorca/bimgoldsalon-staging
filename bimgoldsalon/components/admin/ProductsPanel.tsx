"use client";
import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { removeProduct, updateStock } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import { STOCK_BADGE, stockLevel, type AdminProduct } from "@/lib/products";
import AdminDialog from "./AdminDialog";
import ConfirmButton from "./ConfirmButton";
import ProductForm from "./ProductForm";
import ProductOptionsButton from "./ProductOptionsDialog";

export type StockPreset = "all" | "in" | "low" | "out" | "restock";

const field =
  "rounded border border-border bg-white px-3 py-2 text-base focus:border-primary focus:outline-none md:text-sm";

export default function ProductsPanel({
  products,
  initialStockFilter = "all",
}: {
  products: AdminProduct[];
  initialStockFilter?: StockPreset;
}) {
  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] =
    useState<StockPreset>(initialStockFilter);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (category !== "all" && p.category !== category) return false;
      const level = stockLevel(p.stock);
      if (stockFilter === "restock") return level !== "in";
      if (stockFilter !== "all" && level !== stockFilter) return false;
      return true;
    });
  }, [products, query, category, stockFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
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
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockPreset)}
            aria-label="Filter by stock level"
            className={field}
          >
            <option value="all">All stock levels</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
            <option value="restock">Needs restock</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90"
        >
          <Plus className="size-4" /> Add product
        </button>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Showing {filtered.length} of {products.length} products
      </p>

      <div className="mt-2 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f3] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Color</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No products match those filters.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const badge = STOCK_BADGE[stockLevel(p.stock)];
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt=""
                          className="size-10 rounded object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded bg-[#ebebeb]" />
                      )}
                    </td>
                    <td className="max-w-md px-4 py-3 font-medium">
                      <span className="line-clamp-3" title={p.name}>
                        {p.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                      {formatPrice(p.salePrice)}
                      {p.discountPercent > 0 && (
                        <span className="block text-[11px] font-normal text-muted-foreground">
                          <span className="line-through">
                            {formatPrice(p.price)}
                          </span>{" "}
                          · -{Math.round(p.discountPercent)}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StockCell
                        key={`${p.id}-${p.stock}`}
                        id={p.id}
                        stock={p.stock}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.color}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <ProductOptionsButton
                          productId={p.id}
                          productName={p.name}
                        />
                        <button
                          type="button"
                          aria-label={`Edit ${p.name}`}
                          onClick={() => setEditing(p)}
                          className="rounded border border-border p-1.5 text-muted-foreground hover:bg-primary hover:text-white"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <ConfirmButton
                          label={`Delete ${p.name}`}
                          action={() => removeProduct(p.id)}
                        >
                          <Trash2 className="size-4" />
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add product" : "Edit product"}
      >
        {editing && (
          <ProductForm
            initialProduct={editing === "new" ? null : editing}
            categories={categories}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        )}
      </AdminDialog>
    </div>
  );
}

// Type a new number and press Enter (or Save) to restock without opening the form
function StockCell({ id, stock }: { id: number; stock: number }) {
  const [value, setValue] = useState(String(stock));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const dirty = value !== String(stock);

  const save = () => {
    const n = Number(value);
    if (value.trim() === "" || !Number.isInteger(n) || n < 0) {
      setError("Whole number, 0 or more");
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await updateStock(id, n);
      if (!res.ok) setError(res.error);
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <input
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        value={value}
        aria-label="Stock quantity"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        className="w-16 rounded border border-border px-2 py-1 text-right text-base focus:border-primary focus:outline-none md:text-sm"
      />
      {dirty && (
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase text-white disabled:opacity-50"
        >
          {pending ? "…" : "Save"}
        </button>
      )}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
}
