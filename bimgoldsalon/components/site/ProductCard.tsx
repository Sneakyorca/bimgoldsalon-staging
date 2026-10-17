"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";

type Props = {
  product: Product;
  /** "carousel" = your original compact card, "grid" = bigger card used on the shop page */
  variant?: "carousel" | "grid";
  /** Shows the IN STOCK / OUT OF STOCK badge */
  showStatus?: boolean;
};

const ProductCard = ({
  product,
  variant = "carousel",
  showStatus = false,
}: Props) => {
  const { ready, cartItems, addToCart } = useCart();
  const isGrid = variant === "grid";
  const hasDiscount = product.discountPercent > 0;
  const inCart = ready
    ? (cartItems.find((i) => i.id === product.id)?.qty ?? 0)
    : 0;

  const handleAdd = (e: MouseEvent) => {
    e.preventDefault(); // the card is a link, don't navigate
    e.stopPropagation();
    addToCart(product);
  };

  const label = !product.inStock
    ? `${product.name} is out of stock`
    : inCart > 0
      ? `Add another ${product.name} to cart (${inCart} in cart)`
      : `Add ${product.name} to cart`;

  return (
    <Link
      href={`/product/${product.id}`}
      className={`relative rounded-lg bg-card p-4 ${
        isGrid ? "block h-full" : "inline-block h-full pt-0 md:pt-4"
      }`}
    >
      {showStatus && (
        <span
          className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[12px] font-semibold uppercase text-white md:text-[14px] ${
            product.inStock ? "bg-green-600" : "bg-red-700"
          }`}
        >
          {product.inStock ? "In stock" : "Out of stock"}
        </span>
      )}
      {hasDiscount && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[12px] font-semibold text-white md:text-[13px]">
          -{Math.round(product.discountPercent)}%
        </span>
      )}
      <Image
        src={product.image}
        alt={product.name}
        width={220}
        height={220}
        className={`mx-auto w-auto object-contain ${
          isGrid ? "h-64 lg:h-72.25" : "h-32.25 lg:h-72.25"
        }`}
      />
      <h3 className="mt-3 line-clamp-2 text-[16px] font-semibold">
        {product.name}
      </h3>
      <p
        className={
          isGrid
            ? "mt-1 line-clamp-4 text-[14px] leading-snug md:text-[10px]"
            : "mt-1 line-clamp-1 text-[10px] leading-snug lg:line-clamp-4"
        }
      >
        {product.blurb}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[16px] font-bold">
          {formatPrice(product.price)}
          {hasDiscount && (
            <span className="ml-2 text-[12px] font-normal text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock}
          aria-label={label}
          className="relative grid size-6 place-items-center rounded-full bg-primary text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart className="size-4" />
          {inCart > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white"
            >
              {inCart}
            </span>
          )}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
