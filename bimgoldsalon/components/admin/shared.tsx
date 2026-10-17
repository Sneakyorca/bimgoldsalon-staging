"use client";
import { useState, useTransition } from "react";
export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export { BOOKING_STATUSES, LOW_STOCK_THRESHOLD } from "@/dummydata/accountData";
export const tone: Record<string, string> = { pending: "bg-amber-100 text-amber-700", confirmed: "bg-blue-100 text-blue-700", completed: "bg-emerald-100 text-emerald-700", cancelled: "bg-rose-100 text-rose-700", paid: "bg-emerald-100 text-emerald-700", failed: "bg-rose-100 text-rose-700", refunded: "bg-gray-100 text-gray-700" };
export const fmt = (n: number | string) => `£${Number(n).toFixed(2)}`;
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
export const remainingBalance = (price: number, deposit: number) => Math.max(0, price - deposit);
export const stockStatus = (stock: number, low = 5) => stock <= 0 ? { label: "Out of Stock", className: "bg-rose-100 text-rose-700" } : stock <= low ? { label: "Low Stock", className: "bg-amber-100 text-amber-700" } : { label: "In Stock", className: "bg-emerald-100 text-emerald-700" };
export function StatusSelect({ value, options, onChange }: { value: string; options: readonly string[]; onChange: (value: string) => void }) { return <select value={value} aria-label="Change status" onChange={(e) => onChange(e.target.value)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${tone[value] ?? "bg-gray-100"}`}>{options.map((option) => <option key={option}>{option}</option>)}</select>; }
type Res = void | { ok: true } | { ok: false; error: string };
export function useAdminRun() { const [pending, start] = useTransition(); const [error, setError] = useState(""); const run = (fn: () => Promise<Res>) => { setError(""); start(async () => { try { const result = await fn(); if (result && !result.ok) setError(result.error); } catch { setError("That change did not save. Refresh and try again."); } }); }; return { run, pending, error }; }
export type Run = ReturnType<typeof useAdminRun>["run"];
export const inputCls = "mt-1 w-full rounded border border-foreground/15 px-3 py-2 text-sm focus:border-primary focus:outline-none";
export const labelCls = "text-[11px] font-semibold uppercase tracking-wide text-foreground/60";
export const primaryBtn = "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90 disabled:opacity-40";
export const iconBtn = "rounded border border-foreground/15 p-1.5 hover:bg-foreground hover:text-white";
export const dangerIconBtn = "rounded border border-foreground/15 p-1.5 hover:bg-rose-600 hover:text-white";
export const tableWrap = "overflow-x-auto rounded-lg border border-foreground/10 bg-white";
export const theadCls = "bg-secondary text-left text-[11px] uppercase tracking-wide text-foreground/60";
