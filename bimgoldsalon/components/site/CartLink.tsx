"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

/** Navbar cart button with a live item-count badge. Keep it next to Navbar.tsx. */
const CartLink = ({ className = "" }: { className?: string }) => {
  const { ready, cartCount } = useCart();
  // `ready` stays false until the cart is read from localStorage, so the server
  // render and first client render match (no hydration warning)
  const count = ready ? cartCount : 0;

  return (
    <Link
      href="/cart"
      aria-label={
        count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"
      }
      className={`relative ${className}`}
    >
      <ShoppingCart className="size-4 lg:hidden" />
      <span className="hidden lg:inline">Cart</span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
};

export default CartLink;
