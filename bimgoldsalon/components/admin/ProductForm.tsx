"use client";
import { useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import {
  LOW_STOCK_THRESHOLD,
  discountedPrice,
  type AdminProduct,
} from "@/lib/products";
import CategoryField from "./CategoryField";
import ExtraInfoEditor from "./ExtraInfoEditor";
import ImageField from "./ImageField";
import { inputCls, labelCls } from "./shared";

export default function ProductForm({
  initialProduct,
  categories,
  onSaved,
  onCancel,
}: {
  initialProduct: AdminProduct | null;
  categories: string[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(
    initialProduct?.description ?? "",
  );
  const [price, setPrice] = useState(String(initialProduct?.price ?? ""));
  const [discount, setDiscount] = useState(
    String(initialProduct?.discountPercent ?? 0),
  );
  const [category, setCategory] = useState(initialProduct?.category ?? "");
  const [color, setColor] = useState(initialProduct?.color ?? "");
  const [stock, setStock] = useState(String(initialProduct?.stock ?? 0));
  const [image, setImage] = useState(initialProduct?.image ?? "");
  const [images, setImages] = useState(initialProduct?.images ?? []);
  const [extraInfo, setExtraInfo] = useState(initialProduct?.extraInfo ?? {});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const priceNum = Number(price);
  const discountNum = Number(discount);
  const showPreview =
    price.trim() !== "" &&
    Number.isFinite(priceNum) &&
    Number.isFinite(discountNum) &&
    discountNum > 0 &&
    discountNum <= 95;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || uploading) return;
    setError("");

    const stockNum = Number(stock);
    if (!name.trim()) return setError("Enter a product name.");
    if (!category.trim()) return setError("Choose or add a category.");
    if (price.trim() === "" || !Number.isFinite(priceNum) || priceNum < 0)
      return setError("Enter a valid price.");
    if (
      discount.trim() === "" ||
      !Number.isFinite(discountNum) ||
      discountNum < 0 ||
      discountNum > 95
    )
      return setError("Discount must be between 0 and 95.");
    if (!Number.isInteger(stockNum) || stockNum < 0)
      return setError("Stock must be a whole number, 0 or more.");

    setSaving(true);
    try {
      const result = await saveProduct(initialProduct?.id ?? null, {
        name,
        description,
        category,
        price: priceNum,
        discountPercent: discountNum,
        stock: stockNum,
        color,
        image,
        images,
        extraInfo,
      });
      if (!result.ok) setError(result.error);
      else onSaved();
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
        {initialProduct ? "Edit product" : "Add product"}
      </h3>
      <label className="block">
        <span className={labelCls}>Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className={labelCls}>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={2000}
          className={inputCls}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Regular price (£)</span>
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
          <span className={labelCls}>Discount (%)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max="95"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>
      {showPreview ? (
        <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Customers will pay{" "}
          <strong>{formatPrice(discountedPrice(priceNum, discountNum))}</strong>{" "}
          instead of {formatPrice(priceNum)}.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Leave the discount at 0 for no sale. The discounted price is what
          customers are charged.
        </p>
      )}

      <CategoryField
        value={category}
        onChange={setCategory}
        categories={categories}
      />
      <label className="block">
        <span className={labelCls}>Color</span>
        <input
          value={color}
          onChange={(e) => setColor(e.target.value)}
          maxLength={40}
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className={labelCls}>Stock</span>
        <input
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className={inputCls}
        />
        <span className="mt-1 block text-xs text-muted-foreground">
          You&apos;ll be warned on the admin overview at {LOW_STOCK_THRESHOLD}{" "}
          or fewer.
        </span>
      </label>
      <ImageField
        image={image}
        images={images}
        onImage={setImage}
        onImages={setImages}
        folder="products"
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
          {saving ? "Saving…" : uploading ? "Uploading…" : "Save product"}
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
