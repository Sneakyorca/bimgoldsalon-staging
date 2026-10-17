"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/products";
import QtyStepper from "../site/QtyStepper";

/**
 * Not in cart  -> "Add to cart" button.
 * In cart      -> stepper bound to the real cart quantity (minus at 1 removes it).
 */
const ProductActions = ({ product }: { product: Product }) => {
  const { ready, cartItems, addToCart, setQty, remove } = useCart();
  const line = cartItems.find((i) => i.id === product.id);

  if (!product.inStock)
    return (
      <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-[16px] font-semibold text-red-700">
        This product is currently out of stock.
      </p>
    );

  // wait for the cart to load from localStorage so the right state shows first time
  if (!ready) return <div className="mt-8 h-12" aria-busy="true" />;

  if (!line)
    return (
      <div className="mt-8">
        <button
          type="button"
          onClick={() => addToCart(product)}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-[16px] font-semibold text-white"
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
};

export default ProductActions;
