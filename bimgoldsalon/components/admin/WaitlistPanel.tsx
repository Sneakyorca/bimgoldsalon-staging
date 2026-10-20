"use client";
import { useEffect, useState, useTransition } from "react";
import { Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeWaitlistEntry, sendWaitlistNotice } from "@/app/admin/actions";
import type { WaitlistView } from "@/Data/waitlist";
import { formatLongDate, salonToday } from "@/lib/booking";
import ConfirmButton from "./ConfirmButton";

const when = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/London",
  });

export default function WaitlistPanel({
  entries,
}: {
  entries: WaitlistView[];
}) {
  const [rows, setRows] = useState(entries);
  useEffect(() => {
    setRows(entries);
  }, [entries]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const today = salonToday().date;

  const notify = (id: string) => {
    setError("");
    setBusyId(id);
    startTransition(async () => {
      try {
        const res = await sendWaitlistNotice(id);
        if (res.ok) {
          toast.success("Email is on its way");
          setRows((cur) =>
            cur.map((r) =>
              r.id === id ? { ...r, notifiedAt: new Date().toISOString() } : r,
            ),
          );
        } else setError(res.error);
      } catch {
        setError("That didn't work. Please refresh the page and try again.");
      } finally {
        setBusyId(null);
      }
    });
  };

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        People are emailed automatically when a booking for their day is
        cancelled. You can also email someone yourself with the envelope button,
        for example after you reopen a blocked day.
      </p>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f5f3] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Wants</th>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  Nobody is on the waitlist.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const past = r.preferredDate <= today;
                return (
                  <tr
                    key={r.id}
                    className={`border-t border-border align-top ${past ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {r.name}
                      <span className="block text-[12px] font-normal text-muted-foreground">
                        <a href={`mailto:${r.email}`} className="underline">
                          {r.email}
                        </a>
                        {" · "}
                        <a href={`tel:${r.phone}`} className="underline">
                          {r.phone}
                        </a>
                      </span>
                    </td>
                    <td className="max-w-[240px] px-4 py-3 text-muted-foreground">
                      {r.serviceNames}
                      {r.note && (
                        <span className="block text-[12px] italic">
                          “{r.note}”
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatLongDate(r.preferredDate)}
                    </td>
                    <td className="px-4 py-3">
                      {r.notifiedAt ? (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold uppercase text-blue-700">
                          Emailed {when(r.notifiedAt)}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase text-amber-700">
                          Waiting
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          aria-label={`Email ${r.name} now`}
                          title="Email now"
                          disabled={busyId === r.id}
                          onClick={() => notify(r.id)}
                          className="rounded border border-border p-1.5 text-muted-foreground hover:bg-primary hover:text-white disabled:opacity-40"
                        >
                          <Mail className="size-3.5" />
                        </button>
                        <ConfirmButton
                          label={`Remove ${r.name} from the waitlist`}
                          confirmLabel="Yes, remove"
                          action={() => removeWaitlistEntry(r.id)}
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
    </div>
  );
}
