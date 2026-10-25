"use client";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { savePromo } from "@/app/admin/actions";
import { PromoBannerBar, PromoPopupCard } from "@/components/site/PromoClient";
import type { Promo } from "@/Data/promo";
import { PROMO_DURATIONS, PROMO_REPEAT_OPTIONS } from "@/lib/schemas/promo";

const field =
  "w-full rounded border border-border bg-white px-3 py-2 text-base focus:border-primary focus:outline-none md:text-sm";
const pad = (n: number) => String(n).padStart(2, "0");
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

export default function PromoPanel({ promo }: { promo: Promo }) {
  const [enabled, setEnabled] = useState(promo.enabled);
  const [style, setStyle] = useState<"popup" | "banner">(promo.style);
  const [title, setTitle] = useState(promo.title);
  const [message, setMessage] = useState(promo.message);
  const [buttonLabel, setButtonLabel] = useState(promo.buttonLabel);
  const [buttonUrl, setButtonUrl] = useState(promo.buttonUrl);
  const [startsAt, setStartsAt] = useState("");
  const [durationDays, setDurationDays] = useState<number | null>(
    promo.durationDays,
  );
  const [repeatHours, setRepeatHours] = useState(promo.repeatHours);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startSave] = useTransition();

  // times use the device's clock, so they're filled in after the page loads
  useEffect(() => {
    setStartsAt(toLocalInput(promo.startsAt));
  }, [promo.startsAt]);

  const durations: { days: number | null; label: string }[] = [
    ...PROMO_DURATIONS,
  ];
  if (!durations.some((d) => d.days === durationDays))
    durations.push({ days: durationDays, label: `${durationDays} days` });
  const repeats: { hours: number; label: string }[] = [...PROMO_REPEAT_OPTIONS];
  if (!repeats.some((r) => r.hours === repeatHours))
    repeats.push({ hours: repeatHours, label: `After ${repeatHours} hours` });

  const endsText = useMemo(() => {
    if (!durationDays) return "";
    const base = startsAt ? new Date(startsAt) : new Date();
    if (Number.isNaN(base.getTime())) return "";
    return new Date(base.getTime() + durationDays * 86_400_000).toLocaleString(
      "en-GB",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }, [startsAt, durationDays]);

  const status = !promo.enabled
    ? "Off"
    : promo.endsAt && Date.parse(promo.endsAt) <= Date.now()
      ? "Ended"
      : promo.startsAt && Date.parse(promo.startsAt) > Date.now()
        ? "Scheduled"
        : "Live";

  const submit = () => {
    setError("");
    setSaved(false);
    startSave(async () => {
      try {
        const res = await savePromo({
          enabled,
          style,
          title,
          message,
          buttonLabel,
          buttonUrl,
          startsAt: startsAt ? new Date(startsAt).toISOString() : null,
          durationDays,
          repeatHours,
        });
        if (res.ok) setSaved(true);
        else setError(res.error);
      } catch {
        setError("That didn't save. Please try again.");
      }
    });
  };

  const view = { title, message, buttonLabel, buttonUrl };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <section className="space-y-5 rounded-lg border border-border bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Promotion</h2>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${status === "Live" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}
          >
            {status}
          </span>
        </div>

        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="size-5 accent-[#00174b]"
          />
          Show this promotion on the website
        </label>

        <fieldset>
          <legend className="mb-1 text-sm font-medium">How it appears</legend>
          <div className="flex flex-wrap gap-3 text-sm">
            {(
              [
                ["popup", "Pop-up in the middle"],
                ["banner", "Bar at the top"],
              ] as const
            ).map(([v, label]) => (
              <label
                key={v}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 ${style === v ? "border-primary bg-card" : "border-border"}`}
              >
                <input
                  type="radio"
                  name="promo-style"
                  checked={style === v}
                  onChange={() => setStyle(v)}
                  className="accent-[#00174b]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Title" hint={`${title.length}/80`}>
          <input
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 10% off knotless braids"
            className={field}
          />
        </Field>
        <Field label="Message" hint={`${message.length}/240`}>
          <textarea
            value={message}
            maxLength={240}
            rows={3}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Book before Sunday and quote BRAIDS10 at the salon."
            className={field}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Button text (optional)">
            <input
              value={buttonLabel}
              maxLength={30}
              onChange={(e) => setButtonLabel(e.target.value)}
              placeholder="Book now"
              className={field}
            />
          </Field>
          <Field
            label="Button link"
            hint="A page like /booking, or a full https:// link"
          >
            <input
              value={buttonUrl}
              onChange={(e) => setButtonUrl(e.target.value)}
              placeholder="/booking"
              className={field}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Starts"
            hint="Leave as it is to start as soon as you save."
          >
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={field}
              />
              <button
                type="button"
                onClick={() =>
                  setStartsAt(toLocalInput(new Date().toISOString()))
                }
                className="shrink-0 rounded border border-border px-3 text-sm hover:bg-card"
              >
                Now
              </button>
            </div>
          </Field>
          <Field
            label="Runs for"
            hint={
              endsText
                ? ((
                    <>
                      Ends <span suppressHydrationWarning>{endsText}</span>
                    </>
                  ) as unknown as string)
                : undefined
            }
          >
            <select
              value={durationDays ?? ""}
              onChange={(e) =>
                setDurationDays(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              className={field}
            >
              {durations.map((d) => (
                <option key={String(d.days)} value={d.days ?? ""}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="After a visitor closes it, show it again"
          hint="Saving changes shows it again to everyone who closed an earlier version."
        >
          <select
            value={repeatHours}
            onChange={(e) => setRepeatHours(Number(e.target.value))}
            className={field}
          >
            {repeats.map((r) => (
              <option key={r.hours} value={r.hours}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-sm text-emerald-700">
            Saved. It's live on the site within a moment.
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-full bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save promotion"}
        </button>
      </section>

      <aside className="space-y-3">
        <h3 className="font-semibold">Preview</h3>
        <div className="rounded-lg bg-[#e5eaee] p-4">
          {title || message ? (
            style === "popup" ? (
              <div className="grid place-items-center">
                <PromoPopupCard promo={view} onClose={() => {}} preview />
              </div>
            ) : (
              <PromoBannerBar promo={view} onClose={() => {}} preview />
            )
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Type a title or message to see it here.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
