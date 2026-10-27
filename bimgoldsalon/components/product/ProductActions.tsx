"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProductOptionsAction } from "@/app/product/option-actions";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { LOW_STOCK_THRESHOLD, type Product } from "@/lib/products";
import type {
  OptionGroup,
  ProductOptions,
  PublicVariant,
} from "@/lib/variants";
import QtyStepper from "../site/QtyStepper";

const addBtn =
  "inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-[16px] font-semibold text-white transition hover:opacity-90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50";

/** A product with no options: "Add to cart", or a stepper once it's in the cart */
function Simple({ product }: { product: Product }) {
  const { cartItems, addToCart, setQty, remove } = useCart();
  const line = cartItems.find((i) => i.id === product.id);

  if (!product.inStock)
    return (
      <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-[16px] font-semibold text-red-700">
        This product is currently out of stock.
      </p>
    );

  if (!line)
    return (
      <div className="mt-8">
        <button
          type="button"
          onClick={() => {
            addToCart(product);
            toast.success("Added to cart");
          }}
          className={addBtn}
        >
          <ShoppingCart className="size-5" />
          Add to cart
        </button>
      </div>
    );

  return (
    <div className="mt-8 space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <QtyStepper
          qty={line.qty}
          min={0}
          label={product.name}
          onChange={(d) =>
            line.qty + d < 1 ? remove(product.id) : setQty(product.id, d)
          }
        />
        <Link
          href="/cart"
          className="inline-flex h-12 items-center rounded-full border border-primary px-8 text-[16px] font-semibold text-primary hover:bg-card"
        >
          View cart
        </Link>
      </div>
      <p role="status" className="text-[15px]">
        {line.qty} in your cart
      </p>
    </div>
  );
}

/** A product with options: choose every option (boxes), then add that exact combination */
function WithOptions({
  product,
  options,
}: {
  product: Product;
  options: ProductOptions;
}) {
  const { cartItems, addToCart, setQty, remove } = useCart();
  const { groups, variants } = options;
  const [pick, setPick] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      groups
        .filter((g) => g.values.length === 1)
        .map((g) => [g.name, g.values[0].label]),
    ),
  );
  const [showErrors, setShowErrors] = useState(false);

  // arriving from the cart: pre-select the combination that was clicked
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("v"));
    const match = v ? variants.find((x) => x.id === v) : undefined;
    if (match) setPick(match.selections);
  }, [variants]);

  const chosen = groups.every((g) => pick[g.name]);
  const variant: PublicVariant | undefined = chosen
    ? variants.find((v) =>
        groups.every((g) => v.selections[g.name] === pick[g.name]),
      )
    : undefined;

  // a value is greyed out when no in-stock combination with it matches your other choices
  const canPick = (g: OptionGroup, value: string) =>
    variants.some(
      (v) =>
        v.selections[g.name] === value &&
        v.stock > 0 &&
        groups.every(
          (h) =>
            h.name === g.name ||
            !pick[h.name] ||
            v.selections[h.name] === pick[h.name],
        ),
    );

  // the combination is its own product, so the cart, checkout and orders just work
  const asProduct = (v: PublicVariant): Product => ({
    ...product,
    id: v.id,
    name: v.name,
    price: v.price,
    originalPrice: v.originalPrice,
    discountPercent: v.discountPercent,
    stock: v.stock,
    inStock: v.stock > 0,
    hasOptions: false,
    priceFrom: false,
  });
  const line = variant ? cartItems.find((i) => i.id === variant.id) : undefined;

  const add = () => {
    if (!chosen) {
      setShowErrors(true);
      toast.error(
        `Please choose ${groups
          .filter((g) => !pick[g.name])
          .map((g) => g.name.toLowerCase())
          .join(" and ")}`,
      );
      return;
    }
    if (!variant || variant.stock <= 0) return;
    addToCart(asProduct(variant));
    toast.success("Added to cart");
  };

  return (
    <div className="mt-8 space-y-6">
      {groups.map((g) => {
        const missing = showErrors && !pick[g.name];
        return (
          <fieldset
            key={g.name}
            className={missing ? "t-error-state-shake" : ""}
          >
            <legend className="text-[15px] font-semibold">
              {g.name}
              {pick[g.name] && (
                <span className="ml-2 font-normal text-gray-600">
                  {pick[g.name]}
                </span>
              )}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {g.values.map((v) => {
                const on = pick[g.name] === v.label;
                const can = canPick(g, v.label);
                return (
                  <button
                    key={v.label}
                    type="button"
                    aria-pressed={on}
                    disabled={!can && !on}
                    onClick={() =>
                      setPick((p) => ({ ...p, [g.name]: on ? "" : v.label }))
                    }
                    className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-[15px] font-medium transition ${
                      on
                        ? "border-primary bg-primary text-white"
                        : "border-black/40 bg-white hover:border-black"
                    } ${!can && !on ? "cursor-not-allowed line-through opacity-50" : ""}`}
                  >
                    {v.swatch && (
                      <span
                        aria-hidden="true"
                        className="size-4 rounded-full border border-black/20"
                        style={{ backgroundColor: v.swatch }}
                      />
                    )}
                    {v.label}
                  </button>
                );
              })}
            </div>
            {missing && (
              <p role="alert" className="mt-2 text-[13px] text-red-600">
                Please choose a {g.name.toLowerCase()}.
              </p>
            )}
          </fieldset>
        );
      })}

      {variant ? (
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[24px] font-semibold">
            {formatPrice(variant.price)}
          </span>
          {variant.discountPercent > 0 && (
            <span className="text-[16px] text-gray-500 line-through">
              {formatPrice(variant.originalPrice)}
            </span>
          )}
          {variant.stock <= 0 ? (
            <span className="text-[14px] font-semibold text-red-700">
              Out of stock
            </span>
          ) : variant.stock <= LOW_STOCK_THRESHOLD ? (
            <span className="text-[14px] font-semibold text-amber-700">
              Only {variant.stock} left
            </span>
          ) : (
            <span className="text-[14px] text-green-700">In stock</span>
          )}
        </p>
      ) : chosen ? (
        <p role="alert" className="text-[15px] text-red-600">
          That combination isn&apos;t available.
        </p>
      ) : null}

      {line && variant ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <QtyStepper
              qty={line.qty}
              min={0}
              label={variant.name}
              onChange={(d) =>
                line.qty + d < 1 ? remove(variant.id) : setQty(variant.id, d)
              }
            />
            <Link
              href="/cart"
              className="inline-flex h-12 items-center rounded-full border border-primary px-8 text-[16px] font-semibold text-primary hover:bg-card"
            >
              View cart
            </Link>
          </div>
          <p role="status" className="text-[15px]">
            {line.qty} in your cart
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={add}
          disabled={!!variant && variant.stock <= 0}
          className={addBtn}
        >
          <ShoppingCart className="size-5" />
          {variant && variant.stock <= 0 ? "Out of stock" : "Add to cart"}
        </button>
      )}
    </div>
  );
}

const ProductActions = ({ product }: { product: Product }) => {
  const { ready } = useCart();
  // undefined = still finding out. If the page already told us there are no options, skip the lookup.
  const [options, setOptions] = useState<ProductOptions | null | undefined>(
    product.hasOptions === false ? null : undefined,
  );

  useEffect(() => {
    if (product.hasOptions === false) return;
    let cancelled = false;
    getProductOptionsAction(product.id)
      .then((o) => !cancelled && setOptions(o))
      .catch(() => !cancelled && setOptions(null));
    return () => {
      cancelled = true;
    };
  }, [product.id, product.hasOptions]);

  // wait for the cart to load from localStorage so the right state shows first time
  if (!ready || options === undefined)
    return <div className="mt-8 h-12" aria-busy="true" />;

  return options ? (
    <WithOptions product={product} options={options} />
  ) : (
    <Simple product={product} />
  );
};

export default ProductActions;
