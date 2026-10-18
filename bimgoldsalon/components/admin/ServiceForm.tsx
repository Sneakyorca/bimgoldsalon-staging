"use client";
import { useState } from "react";
import { toast } from "sonner";
import { saveService } from "@/app/admin/actions";
import { formatDuration } from "@/lib/booking";
import { formatPrice } from "@/lib/format";
import {
  DEFAULT_DEPOSIT_PERCENT,
  DEFAULT_SERVICE_CAPACITY,
  serviceDeposit,
  type AdminService,
} from "@/lib/services";
import CategoryField from "./CategoryField";
import ExtraInfoEditor from "./ExtraInfoEditor";
import ImageField from "./ImageField";
import { inputCls, labelCls } from "./shared";

export default function ServiceForm({
  initialService,
  categories,
  onSaved,
  onCancel,
}: {
  initialService: AdminService | null;
  categories: string[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialService?.name ?? "");
  const [category, setCategory] = useState(initialService?.category ?? "");
  const [price, setPrice] = useState(String(initialService?.price ?? ""));
  const [duration, setDuration] = useState(
    String(initialService?.durationMin ?? 60),
  );
  const [durationLabel, setDurationLabel] = useState(
    initialService?.durationLabel ?? "",
  );
  const [deposit, setDeposit] = useState(
    String(initialService?.depositPercent ?? DEFAULT_DEPOSIT_PERCENT),
  );
  const [capacity, setCapacity] = useState(
    String(initialService?.capacity ?? DEFAULT_SERVICE_CAPACITY),
  );
  const [featured, setFeatured] = useState(initialService?.featured ?? false);
  const [image, setImage] = useState(initialService?.image ?? "");
  const [images, setImages] = useState(initialService?.images ?? []);
  const [extraInfo, setExtraInfo] = useState(initialService?.extraInfo ?? {});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const priceNum = Number(price);
  const durationNum = Number(duration);
  const depositNum = Number(deposit);
  const capacityNum = Number(capacity);
  const depositOk =
    price.trim() !== "" &&
    Number.isFinite(priceNum) &&
    Number.isFinite(depositNum) &&
    depositNum >= 0 &&
    depositNum <= 100;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || uploading) return;
    setError("");

    if (!name.trim()) return setError("Enter a service name.");
    if (!category.trim()) return setError("Choose or add a category.");
    if (price.trim() === "" || !Number.isFinite(priceNum) || priceNum < 0)
      return setError("Enter a valid price.");
    if (!Number.isInteger(durationNum) || durationNum < 5 || durationNum > 720)
      return setError("Duration must be a whole number of minutes, 5 to 720.");
    if (!Number.isFinite(depositNum) || depositNum < 0 || depositNum > 100)
      return setError("Deposit must be between 0 and 100%.");
    if (!Number.isInteger(capacityNum) || capacityNum < 1 || capacityNum > 20)
      return setError(
        "Clients at the same time must be a whole number, 1 to 20.",
      );

    setSaving(true);
    try {
      const result = await saveService(initialService?.id ?? null, {
        name,
        category,
        price: priceNum,
        durationMin: durationNum,
        durationLabel,
        depositPercent: depositNum,
        featured,
        capacity: capacityNum,
        image,
        images,
        extraInfo,
      });
      if (!result.ok) setError(result.error);
      else {
        toast.success("Saved");
        onSaved();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-lg border bg-white p-5"
    >
      <h3 className="text-lg font-semibold">
        {initialService ? "Edit service" : "Add service"}
      </h3>
      <label className="block">
        <span className={labelCls}>Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className={inputCls}
        />
      </label>
      <CategoryField
        value={category}
        onChange={setCategory}
        categories={categories}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>&quot;From&quot; price (£)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Deposit (%)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max="100"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        {depositOk
          ? `Customers pay a deposit of ${formatPrice(serviceDeposit(priceNum, depositNum))} to secure this service.`
          : "Enter a price and a deposit between 0 and 100%."}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Duration (minutes)</span>
          <input
            type="number"
            inputMode="numeric"
            step="5"
            min="5"
            max="720"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={inputCls}
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Used to work out free time slots
            {Number.isInteger(durationNum) && durationNum > 0
              ? ` (${formatDuration(durationNum)})`
              : ""}
            .
          </span>
        </label>
        <label className="block">
          <span className={labelCls}>Duration label (optional)</span>
          <input
            value={durationLabel}
            onChange={(e) => setDurationLabel(e.target.value)}
            maxLength={40}
            placeholder="e.g. 1hr - 2hr"
            className={inputCls}
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Shown to customers instead of the exact time.
          </span>
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>Clients at the same time</span>
        <input
          type="number"
          inputMode="numeric"
          step="1"
          min="1"
          max="20"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className={inputCls}
        />
        <span className="mt-1 block text-xs text-muted-foreground">
          How many clients can have this service at the same time. 1 means one
          at a time. Raise it if several stylists do this service.
        </span>
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="size-5 accent-primary"
        />
        Show on the homepage
      </label>

      <ImageField
        image={image}
        images={images}
        onImage={setImage}
        onImages={setImages}
        folder="services"
        onBusyChange={setUploading}
      />
      <ExtraInfoEditor value={extraInfo} onChange={setExtraInfo} />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : uploading ? "Uploading…" : "Save service"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border px-5 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
