"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/context/CartContext";
import type { CSSProperties } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/lib/format";
import CheckoutSteps from "../site/CheckoutSteps";
import QtyStepper from "../site/QtyStepper";

const Thumb = ({ item, className }: { item: CartItem; className: string }) => (
  <div
    className={`grid place-items-center overflow-hidden rounded-xl border border-black bg-card ${className}`}
  >
    <Image
      src={item.image}
      alt={item.name}
      width={96}
      height={96}
      className="h-full w-auto object-contain p-2"
    />
  </div>
);

const RemoveButton = ({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: () => void;
}) => (
  <button
    type="button"
    onClick={onRemove}
    aria-label={`Remove ${item.name} from cart`}
    className="grid size-5 shrink-0 place-items-center rounded border border-gray-500 text-gray-500 hover:border-black hover:text-black"
  >
    <X className="size-3" />
  </button>
);

// column widths shrink on smaller desktops so nothing collides
const rowCols =
  "md:grid-cols-[minmax(0,1fr)_90px_110px_100px] lg:grid-cols-[minmax(0,1fr)_80px_104px_100px] xl:grid-cols-[minmax(0,1fr)_100px_110px_110px]";

const CartView = () => {
  const { ready, cartItems, setQty, remove, subtotal, deliveryFee, total } =
    useCart();

  if (!ready)
    return (
      <section
        aria-busy="true"
        aria-label="Loading your cart"
        className="mx-auto w-full max-w-360 px-5 pb-16 pt-6 lg:px-12"
      >
        <Skeleton className="mx-auto my-6 h-10 w-64 md:mx-0 md:mt-12" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_507px]">
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl md:h-28" />
            ))}
          </div>
          <Skeleton className="h-56 w-full rounded-3xl" />
        </div>
      </section>
    );

  return (
    <section className="mx-auto w-full max-w-360 px-5 pb-16 pt-6 lg:px-12">
      <div className="md:hidden">
        <CheckoutSteps current={1} />
      </div>
      <h1 className="my-6 text-center text-[32px] font-semibold md:mb-10 md:mt-12 md:text-left md:text-[40px]">
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[18px]">Your cart is empty.</p>
          <Link
            href="/product"
            className="mt-6 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start xl:grid-cols-[minmax(0,1fr)_507px] xl:gap-19">
          <div>
            {/* desktop header */}
            <div
              className={`hidden gap-2 border-y border-black py-4 text-[16px] font-semibold md:grid xl:text-[18px] ${rowCols}`}
            >
              <span>Products</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Subtotal</span>
            </div>

            <ul>
              {cartItems.map((item, index) => (
                <li
                  key={item.id}
                  className="fade-up"
                  style={{ "--i": index } as CSSProperties}
                >
                  {/* mobile row */}
                  <div className="flex gap-4 border-t border-black py-5 md:hidden">
                    <Thumb item={item} className="h-24 w-28 shrink-0" />
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[20px] font-semibold leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[14px]">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                        <RemoveButton
                          item={item}
                          onRemove={() => remove(item.id)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <QtyStepper
                          qty={item.qty}
                          label={item.name}
                          onChange={(d) => setQty(item.id, d)}
                        />
                        <span className="font-semibold">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* desktop row */}
                  <div
                    className={`hidden items-center gap-2 py-3 text-[16px] font-medium md:grid ${rowCols}`}
                  >
                    <div className="flex min-w-0 items-center gap-3 xl:gap-4">
                      <RemoveButton
                        item={item}
                        onRemove={() => remove(item.id)}
                      />
                      <Thumb
                        item={item}
                        className="size-20 shrink-0 xl:size-25"
                      />
                      <span className="min-w-0 break-words">{item.name}</span>
                    </div>
                    <span className="whitespace-nowrap">
                      {formatPrice(item.price)}
                    </span>
                    <QtyStepper
                      qty={item.qty}
                      label={item.name}
                      onChange={(d) => setQty(item.id, d)}
                    />
                    <span className="whitespace-nowrap">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* summary */}
          <aside className="rounded-3xl bg-[#eeeeee] p-5 md:ml-auto md:w-full md:max-w-md md:p-6 lg:max-w-none lg:rounded-xl lg:border lg:border-black/40 lg:bg-transparent">
            <dl className="space-y-4 text-[16px] md:text-[18px]">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between border-b border-black/30 pb-4">
                <dt>Shipping</dt>
                <dd>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Total</dt>
                <dd className="text-[22px] font-semibold md:text-[24px]">
                  {formatPrice(total)}
                </dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="mx-auto mt-8 block w-fit max-w-full rounded-full bg-primary px-8 py-3 text-center text-[18px] font-semibold text-white transition hover:opacity-90 hover:shadow-lg xl:px-14"
            >
              Proceed To Checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CartView;
