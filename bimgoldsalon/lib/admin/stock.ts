import { LOW_STOCK_THRESHOLD } from "./constants";
export const stockStatus = (stock: number) =>
  stock <= 0
    ? { label: "Out of stock", className: "bg-rose-100 text-rose-700" }
    : stock <= LOW_STOCK_THRESHOLD
      ? { label: "Low stock", className: "bg-amber-100 text-amber-700" }
      : { label: "In stock", className: "bg-emerald-100 text-emerald-700" };
