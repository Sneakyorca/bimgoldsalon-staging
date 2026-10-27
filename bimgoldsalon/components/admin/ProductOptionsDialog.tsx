"use client";

import { SlidersHorizontal, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getProductOptionsForAdmin,
  saveProductOptions,
} from "@/app/admin/actions";
import {
  MAX_COMBINATIONS,
  MAX_GROUPS,
  combinations,
  keyOf,
  selectionsFromKey,
  type OptionGroup,
} from "@/lib/variants";
import AdminDialog from "./AdminDialog";
const inputCls =
  "h-10 rounded border border-border bg-white px-3 text-base focus:border-primary focus:outline-none md:text-sm";

type Cell = { priceDelta: string; stock: string };
const SEP = "\u0001";
const cellKey = (picks: string[]) => picks.join(SEP);

function Editor({
  productId,
  onDone,
}: {
  productId: number;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [cells, setCells] = useState<Record<string, Cell>>({});
  const [error, setError] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [bulkDelta, setBulkDelta] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getProductOptionsForAdmin(productId)
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setError(res.error);
        } else {
          const g = res.data.groups;
          const next: Record<string, Cell> = {};
          for (const v of res.data.variants) {
            const sel = selectionsFromKey(v.key);
            next[cellKey(g.map((gr) => sel[gr.name] ?? ""))] = {
              priceDelta: String(v.priceDelta),
              stock: String(v.stock),
            };
          }
          setGroups(g);
          setCells(next);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load the options.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const rows = useMemo(() => combinations(groups), [groups]);
  const cell = (picks: string[]): Cell =>
    cells[cellKey(picks)] ?? { priceDelta: "0", stock: "0" };
  const setCell = (picks: string[], patch: Partial<Cell>) =>
    setCells((cur) => ({
      ...cur,
      [cellKey(picks)]: { ...cell(picks), ...patch },
    }));
  const zeroStock = rows.filter((p) => Number(cell(p).stock) <= 0).length;

  const setGroup = (i: number, patch: Partial<OptionGroup>) =>
    setGroups((cur) =>
      cur.map((g, idx) => (idx === i ? { ...g, ...patch } : g)),
    );

  /** "Black, Brown #6f4e37, Burgundy": a colour code after a name adds a colour dot */
  const addValues = (i: number, text: string) => {
    const have = new Set(groups[i].values.map((v) => v.label.toLowerCase()));
    const added = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((entry) => {
        const m = entry.match(/^(.*?)\s*(#[0-9a-fA-F]{6})$/);
        return m
          ? { label: m[1].trim(), swatch: m[2] }
          : { label: entry, swatch: "" };
      })
      .filter(
        (v) =>
          v.label &&
          !have.has(v.label.toLowerCase()) &&
          have.add(v.label.toLowerCase()),
      );
    if (added.length) setGroup(i, { values: [...groups[i].values, ...added] });
  };

  const applyAll = () => {
    setCells((cur) => {
      const next = { ...cur };
      for (const picks of rows) {
        const base = {
          ...(next[cellKey(picks)] ?? { priceDelta: "0", stock: "0" }),
        };
        if (bulkStock.trim() !== "") base.stock = bulkStock.trim();
        if (bulkDelta.trim() !== "") base.priceDelta = bulkDelta.trim();
        next[cellKey(picks)] = base;
      }
      return next;
    });
  };

  const save = () => {
    setError("");
    const variants = rows.map((picks) => {
      const c = cell(picks);
      return {
        key: keyOf(groups, picks),
        priceDelta: Number(c.priceDelta || 0),
        stock: Number(c.stock || 0),
      };
    });
    if (
      variants.some(
        (v) => !Number.isFinite(v.priceDelta) || !Number.isInteger(v.stock),
      )
    )
      return setError(
        "Check the price add-ons and the stock numbers (stock must be a whole number).",
      );
    startTransition(async () => {
      try {
        const res = await saveProductOptions(productId, { groups, variants });
        if (res.ok) {
          toast.success(groups.length ? "Options saved" : "Options removed");
          onDone();
        } else setError(res.error);
      } catch {
        setError("That didn't save. Please refresh the page and try again.");
      }
    });
  };

  if (loading)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
    );

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Add options like <b>Colour</b> or <b>Type</b>. Every combination is sold
        as its own item with its own stock, and customers pick it on the product
        page. While a product has options, its own stock number isn&apos;t used.
      </p>

      {groups.map((g, i) => (
        <section key={i} className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <input
              value={g.name}
              onChange={(e) => setGroup(i, { name: e.target.value })}
              placeholder="Option name, e.g. Colour"
              aria-label="Option name"
              maxLength={30}
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              aria-label={`Remove ${g.name || "option"}`}
              onClick={() => {
                setGroups((cur) => cur.filter((_, idx) => idx !== i));
                setCells({});
              }}
              className="rounded border border-border p-2 text-muted-foreground hover:bg-destructive hover:text-white"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <ul className="mt-3 flex flex-wrap gap-2">
            {g.values.map((v) => (
              <li
                key={v.label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-[#f7f5f3] py-1 pl-3 pr-1.5 text-sm"
              >
                {v.swatch && (
                  <span
                    aria-hidden="true"
                    className="size-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: v.swatch }}
                  />
                )}
                {v.label}
                <button
                  type="button"
                  aria-label={`Remove ${v.label}`}
                  onClick={() =>
                    setGroup(i, {
                      values: g.values.filter((x) => x.label !== v.label),
                    })
                  }
                  className="grid size-5 place-items-center rounded-full hover:bg-black/10"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>

          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              addValues(i, String(new FormData(form).get("values") ?? ""));
              form.reset();
            }}
          >
            <input
              name="values"
              placeholder="Add values: Black, Brown #6f4e37, Burgundy"
              aria-label={`Add values to ${g.name || "this option"}`}
              className={`${inputCls} flex-1`}
            />
            <button
              type="submit"
              className="rounded-full border border-border px-4 text-[11px] font-semibold uppercase tracking-wide hover:bg-primary hover:text-white"
            >
              Add
            </button>
          </form>
        </section>
      ))}

      {groups.length < MAX_GROUPS && (
        <button
          type="button"
          onClick={() => setGroups((cur) => [...cur, { name: "", values: [] }])}
          className="rounded-full border border-dashed border-primary px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary hover:bg-primary hover:text-white"
        >
          + Add an option
        </button>
      )}

      {rows.length > 0 && (
        <section>
          <h3 className="font-semibold">
            {rows.length} combination{rows.length === 1 ? "" : "s"}
            {rows.length > MAX_COMBINATIONS && (
              <span className="ml-2 text-sm font-normal text-red-600">
                (limit {MAX_COMBINATIONS}: remove some values)
              </span>
            )}
          </h3>

          <div className="mt-2 flex flex-wrap items-end gap-2 text-sm">
            <label className="block">
              <span className="text-xs text-muted-foreground">
                Stock for all
              </span>
              <input
                inputMode="numeric"
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value)}
                className={`${inputCls} w-24`}
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">
                Add-on (£) for all
              </span>
              <input
                inputMode="decimal"
                value={bulkDelta}
                onChange={(e) => setBulkDelta(e.target.value)}
                className={`${inputCls} w-24`}
              />
            </label>
            <button
              type="button"
              onClick={applyAll}
              className="h-10 rounded-full border border-border px-4 text-[11px] font-semibold uppercase tracking-wide hover:bg-primary hover:text-white"
            >
              Apply to all
            </button>
          </div>

          <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#f7f5f3] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Option</th>
                  <th className="px-3 py-2">Price add-on (£)</th>
                  <th className="px-3 py-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((picks) => {
                  const c = cell(picks);
                  return (
                    <tr key={cellKey(picks)} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">
                        {picks.join(" / ")}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          inputMode="decimal"
                          aria-label={`Price add-on for ${picks.join(" / ")}`}
                          value={c.priceDelta}
                          onChange={(e) =>
                            setCell(picks, { priceDelta: e.target.value })
                          }
                          className={`${inputCls} w-24`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          inputMode="numeric"
                          aria-label={`Stock for ${picks.join(" / ")}`}
                          value={c.stock}
                          onChange={(e) =>
                            setCell(picks, { stock: e.target.value })
                          }
                          className={`${inputCls} w-24`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {zeroStock > 0 && (
            <p className="mt-2 text-xs text-amber-700">
              {zeroStock} combination{zeroStock === 1 ? " has" : "s have"} 0
              stock, so customers can&apos;t buy{" "}
              {zeroStock === 1 ? "it" : "them"} yet.
            </p>
          )}
        </section>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending
            ? "Saving…"
            : groups.length
              ? "Save options"
              : "Remove all options"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border px-6 py-2.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ProductOptionsButton({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Options for ${productName}`}
        title="Options (colours, types…)"
        className="rounded border border-border p-1.5 text-muted-foreground hover:bg-primary hover:text-white"
      >
        <SlidersHorizontal className="size-3.5" />
      </button>
      <AdminDialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Options: ${productName}`}
      >
        <Editor productId={productId} onDone={() => setOpen(false)} />
      </AdminDialog>
    </>
  );
}
