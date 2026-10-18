"use client";
import { useState, useTransition } from "react";
import { updateStock } from "@/app/admin/actions";
export default function StockEditor({
  id,
  name,
  stock,
}: {
  id: number;
  name: string;
  stock: number;
}) {
  const [value, setValue] = useState(String(stock));
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const commit = () => {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 0) {
      setError("Whole number, 0 or more");
      return;
    }
    if (next === stock) return;
    start(async () => {
      const result = await updateStock(id, next);
      if (!result.ok) setError(result.error);
    });
  };
  return (
    <div>
      <input
        type="number"
        min="0"
        step="1"
        aria-label={`Stock for ${name}`}
        value={value}
        disabled={pending}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        className="w-24 rounded-lg border border-black/40 bg-white px-2 py-1.5 text-right"
      />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
