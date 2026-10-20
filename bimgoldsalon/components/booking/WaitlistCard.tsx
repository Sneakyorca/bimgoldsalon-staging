"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { joinWaitlistAction } from "@/app/booking/waitlist-actions";
import { formatLongDate } from "@/lib/booking";

type Msg = {
  kind: "ok" | "error";
  text: string;
  code?: "login" | "phone";
} | null;

export default function WaitlistCard({
  serviceIds,
  min,
  max,
}: {
  serviceIds: string[];
  min: string;
  max: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return setMsg({ kind: "error", text: "Choose a date first." });
    setMsg(null);
    startTransition(async () => {
      try {
        const res = await joinWaitlistAction({ serviceIds, date, note });
        if (res.ok)
          setMsg({
            kind: "ok",
            text: res.already
              ? `You're already on the waitlist for ${formatLongDate(date)}.`
              : `You're on the waitlist for ${formatLongDate(date)}. We'll email you if a time opens up.`,
          });
        else setMsg({ kind: "error", text: res.error, code: res.code });
      } catch {
        setMsg({
          kind: "error",
          text: "Something went wrong. Please try again.",
        });
      }
    });
  };

  return (
    <div className="mt-8 rounded-2xl border border-black/20 bg-[#f9f9f9] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px]">
          <b>Can&apos;t find a time that suits you?</b> Join the waitlist for a
          fully booked day.
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="rounded-full border border-primary px-5 py-2 text-[14px] font-semibold text-primary hover:bg-card"
        >
          {open ? "Close" : "Join the waitlist"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium">
              Date you&apos;d like
            </span>
            <input
              type="date"
              min={min}
              max={max}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 w-full max-w-xs rounded-lg border border-black bg-white px-3 text-[15px]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium">
              Note (optional)
            </span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              placeholder="e.g. any time after 2pm"
              className="h-11 w-full rounded-lg border border-black bg-white px-3 text-[15px]"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-full bg-primary px-8 text-[14px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Please wait..." : "Add me to the waitlist"}
          </button>
          {msg && (
            <p
              role="alert"
              className={`text-[14px] ${msg.kind === "ok" ? "text-green-700" : "text-red-600"}`}
            >
              {msg.text}{" "}
              {msg.code === "login" && (
                <Link
                  href="/auth?next=/booking/time"
                  className="font-semibold underline"
                >
                  Sign in
                </Link>
              )}
              {msg.code === "phone" && (
                <Link href="/profile/edit" className="font-semibold underline">
                  Add my phone number
                </Link>
              )}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
