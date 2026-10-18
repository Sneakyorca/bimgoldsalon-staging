"use client";
import { useOptimistic, useState, useTransition } from "react";
import { statusTone } from "@/components/site/StatusPill";
import type { ActionResult } from "@/lib/admin/result";
export default function StatusSelect({
  value,
  options,
  label,
  action,
}: {
  value: string;
  options: readonly string[];
  label: string;
  action: (value: string) => Promise<ActionResult>;
}) {
  const [shown, setShown] = useOptimistic(value);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <div>
      <select
        value={shown}
        disabled={pending}
        aria-label={label}
        aria-invalid={Boolean(error)}
        onChange={(e) => {
          const next = e.target.value;
          setError("");
          start(async () => {
            setShown(next);
            const result = await action(next);
            if (!result.ok) setError(result.error);
          });
        }}
        className={`rounded-full px-3 py-1.5 text-[14px] font-semibold capitalize disabled:opacity-70 ${statusTone[shown] ?? "bg-muted"}`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="mt-1 text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
