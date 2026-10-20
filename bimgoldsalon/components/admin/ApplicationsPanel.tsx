"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  removeApplication,
  setApplicationNotes,
  setApplicationStatus,
} from "@/app/admin/actions";
import type { ApplicationView } from "@/Data/applications";
import { APPLICATION_STATUSES } from "@/lib/statuses";
import ConfirmButton from "./ConfirmButton";

const TONE: Record<string, string> = {
  new: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-rose-100 text-rose-700",
};
const when = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  });
const field =
  "rounded border border-border bg-white px-3 py-2 text-base focus:border-primary focus:outline-none md:text-sm";

function Row({
  a,
  onStatus,
  onNotes,
}: {
  a: ApplicationView;
  onStatus: (id: string, status: ApplicationView["status"]) => void;
  onNotes: (id: string, notes: string) => void;
}) {
  const [notes, setNotes] = useState(a.notes);
  return (
    <tr className="border-t border-border align-top">
      <td className="px-4 py-3 font-medium">
        {a.fullName}
        <span className="block text-[12px] font-normal text-muted-foreground">
          {when(a.createdAt)}
        </span>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        <a href={`mailto:${a.email}`} className="underline">
          {a.email}
        </a>
        <br />
        <a href={`tel:${a.phone}`} className="underline">
          {a.phone}
        </a>
      </td>
      <td className="px-4 py-3">{a.applicationType}</td>
      <td className="px-4 py-3">
        <select
          value={a.status}
          aria-label={`Status for ${a.fullName}`}
          onChange={(e) =>
            onStatus(a.id, e.target.value as ApplicationView["status"])
          }
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-primary ${TONE[a.status] ?? "bg-muted"}`}
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-white text-foreground">
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <details>
          <summary className="cursor-pointer text-[13px] text-primary underline">
            {a.notes ? "View notes" : "Add notes"}
          </summary>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={1000}
            className="mt-2 w-56 rounded border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            disabled={notes === a.notes}
            onClick={() => onNotes(a.id, notes)}
            className="mt-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white disabled:opacity-40"
          >
            Save
          </button>
        </details>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <ConfirmButton
            label={`Delete application from ${a.fullName}`}
            action={() => removeApplication(a.id)}
          >
            <Trash2 className="size-4" />
          </ConfirmButton>
        </div>
      </td>
    </tr>
  );
}

export default function ApplicationsPanel({
  applications,
}: {
  applications: ApplicationView[];
}) {
  const [rows, setRows] = useState(applications);
  useEffect(() => {
    setRows(applications);
  }, [applications]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (a) =>
        (statusFilter === "all" || a.status === statusFilter) &&
        (!q ||
          a.fullName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.includes(q)),
    );
  }, [rows, query, statusFilter]);

  const save = (
    id: string,
    change: Partial<ApplicationView>,
    task: () => Promise<{ ok: true } | { ok: false; error: string }>,
  ) => {
    const before = rows;
    setError("");
    setRows((cur) => cur.map((a) => (a.id === id ? { ...a, ...change } : a)));
    startTransition(async () => {
      try {
        const res = await task();
        if (!res.ok) {
          setRows(before);
          setError(res.error);
        }
      } catch {
        setRows(before);
        setError("That didn't save. Please try again.");
      }
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or phone…"
          aria-label="Search applications"
          className={field}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className={field}
        >
          <option value="all">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f3] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Applying for</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No applications yet.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <Row
                  key={a.id}
                  a={a}
                  onStatus={(id, status) =>
                    save(id, { status }, () => setApplicationStatus(id, status))
                  }
                  onNotes={(id, notes) =>
                    save(id, { notes }, () => setApplicationNotes(id, notes))
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
