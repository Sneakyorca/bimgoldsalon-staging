"use client";
import { useState, useTransition, type ReactNode } from "react";
import type { ActionResult } from "@/lib/admin/result";
import { btnDanger, btnGhost, iconBtn } from "./ui";

export default function ConfirmButton({
  label,
  confirmLabel = "Yes, delete",
  action,
  children,
}: {
  label: string;
  confirmLabel?: string;
  action: () => Promise<ActionResult>;
  children: ReactNode;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const run = () =>
    start(async () => {
      setError("");
      try {
        const result = await action();
        if (!result.ok) setError(result.error);
      } catch {
        setError("That didn't work. Please refresh the page and try again.");
      }
      setAsking(false);
    });

  if (asking)
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          className={btnDanger}
          onClick={run}
        >
          {pending ? "Deleting…" : confirmLabel}
        </button>
        <button
          type="button"
          className={btnGhost}
          disabled={pending}
          onClick={() => setAsking(false)}
        >
          Cancel
        </button>
      </span>
    );

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        aria-label={label}
        className={`${iconBtn} hover:!bg-destructive hover:!text-white`}
        onClick={() => {
          setError("");
          setAsking(true);
        }}
      >
        {children}
      </button>
      {error && (
        <span role="alert" className="max-w-52 text-right text-xs text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
