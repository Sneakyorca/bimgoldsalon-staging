"use client";

import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import CartBadge from "./CartBadge";

/**
 * Navbar cart button: shows the item count and opens a mini-cart dropdown.
 * Keep it next to Navbar.tsx. Pass the button styling in via className.
 */
const CartMenu = ({ className = "" }: { className?: string }) => {
  const { ready, cartCount, cartItems, subtotal, remove, clearCart } =
    useCart();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // stays 0 until the cart is read from localStorage (avoids a hydration mismatch)
  const count = ready ? cartCount : 0;

  // close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        aria-label={
          count > 0
            ? `Cart, ${count} ${count === 1 ? "item" : "items"}`
            : "Cart"
        }
        className={`relative cursor-pointer ${className}`}
      >
        <ShoppingCart className="size-4 lg:hidden" />
        <span className="hidden lg:inline">Cart</span>
        <CartBadge
          count={count}
          className="absolute -right-2 -top-2 h-5 min-w-5 text-[11px]"
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Your cart"
          className="pop-in absolute right-0 top-full z-50 mt-3 w-80 rounded-lg border border-black/10 bg-white p-4 text-black shadow-xl"
        >
          <p className="text-[15px] font-semibold">Your Cart</p>

          {cartItems.length === 0 ? (
            <p className="mt-3 text-[14px] text-black/60">
              Your cart is empty.
            </p>
          ) : (
            <>
              <ul className="mt-3 max-h-60 space-y-3 overflow-y-auto pr-1">
                {cartItems.map((it) => (
                  <li key={it.id} className="flex items-center gap-3">
                    <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-card">
                      <Image
                        src={it.image}
                        alt=""
                        width={48}
                        height={48}
                        className="h-full w-auto object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[14px] font-semibold">
                        {it.name}
                      </p>
                      <p className="text-[12px] text-black/60">
                        {formatPrice(it.price)} × {it.qty}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-[13px] font-medium">
                      {formatPrice(it.price * it.qty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(it.id)}
                      aria-label={`Remove ${it.name} from cart`}
                      className="grid size-5 shrink-0 place-items-center rounded border border-gray-400 text-gray-500 hover:border-black hover:text-black"
                    >
                      <X className="size-3" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[15px]">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>

              {cartItems.length > 1 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-2 text-[12px] text-black/60 hover:text-black"
                >
                  Clear cart
                </button>
              )}
            </>
          )}

          <div className="mt-4 space-y-2">
            <Link
              href="/cart"
              onClick={close}
              className="block w-full rounded-full bg-primary py-2.5 text-center text-[13px] font-semibold text-white hover:opacity-90"
            >
              Go to Cart
            </Link>
            {cartItems.length > 0 && (
              <Link
                href="/checkout"
                onClick={close}
                className="block w-full rounded-full border border-primary py-2.5 text-center text-[13px] font-semibold text-primary hover:bg-card"
              >
                Checkout
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartMenu;
