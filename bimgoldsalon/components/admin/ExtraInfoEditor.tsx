"use client";
import { Plus, Trash2 } from "lucide-react";
export default function ExtraInfoEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}) {
  const entries = Object.entries(value);
  const update = (index: number, key: string, val: string) => {
    const next = [...entries];
    next[index] = key === "key" ? [val, next[index][1]] : [next[index][0], val];
    onChange(Object.fromEntries(next));
  };
  return (
    <div>
      <span className="text-xs font-semibold uppercase text-foreground/60">
        Additional details
      </span>
      <div className="mt-2 space-y-2">
        {entries.map(([key, val], index) => (
          <div key={index} className="flex gap-2">
            <input
              aria-label="Detail label"
              value={key}
              onChange={(e) => update(index, "key", e.target.value)}
              className="w-1/3 rounded border px-2 py-2 text-sm"
            />
            <input
              aria-label="Detail value"
              value={val}
              onChange={(e) => update(index, "value", e.target.value)}
              className="flex-1 rounded border px-2 py-2 text-sm"
            />
            <button
              type="button"
              aria-label="Remove detail"
              onClick={() =>
                onChange(
                  Object.fromEntries(entries.filter((_, i) => i !== index)),
                )
              }
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange({ ...value, "": "" })}
        className="mt-2 inline-flex items-center gap-1 text-sm text-primary"
      >
        <Plus className="size-4" /> Add detail
      </button>
    </div>
  );
}
