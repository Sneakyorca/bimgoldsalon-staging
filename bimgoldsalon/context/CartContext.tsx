"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getCartProductsAction } from "@/app/cart/actions";
import type { Product } from "@/lib/products";
import {
  DEFAULT_DELIVERY,
  deliveryOptions,
  type DeliveryMethodId,
} from "@/dummydata/deliveryData";

export type CartItem = Product & { qty: number };

// v3: product ids now come from the database, so older carts are ignored
const CART_KEY = "bimgold_cart_v3";
const MAX_QTY = 99;

type Line = { id: number; qty: number };

const round2 = (n: number) => Math.round(n * 100) / 100;

type CartContextValue = {
  /** false until the cart has been restored (avoids a flash of "empty cart") */
  ready: boolean;
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (p: Product, qty?: number) => void;
  setQty: (id: number, delta: number) => void;
  remove: (id: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryMethod: DeliveryMethodId;
  setDeliveryMethod: (id: DeliveryMethodId) => void;
  deliveryFee: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethodId>(DEFAULT_DELIVERY);
  const restoreFailed = useRef(false);

  // Restore after mount: read saved { id, qty } lines, then ask the server
  // for the current price/stock of those products.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const raw = localStorage.getItem(CART_KEY);
        const saved: unknown = raw ? JSON.parse(raw) : [];
        const lines: Line[] = Array.isArray(saved)
          ? saved.flatMap((s) => {
              const id = Number(s?.id);
              const qty = Number(s?.qty);
              return Number.isInteger(id) &&
                id >= 0 &&
                Number.isInteger(qty) &&
                qty > 0
                ? [{ id, qty: Math.min(MAX_QTY, qty) }]
                : [];
            })
          : [];

        if (lines.length > 0) {
          const fresh = await getCartProductsAction(lines.map((l) => l.id));
          if (cancelled) return;
          const restored: CartItem[] = lines.flatMap((l) => {
            const product = fresh.find((p) => p.id === l.id);
            return product ? [{ ...product, qty: l.qty }] : [];
          });
          // keep anything the visitor added while this was loading
          setCartItems((prev) => [
            ...restored,
            ...prev.filter((p) => !restored.some((r) => r.id === p.id)),
          ]);
        }
      } catch {
        // offline or server error: leave the saved cart untouched
        restoreFailed.current = true;
      }
      if (!cancelled) setReady(true);
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    // don't overwrite a saved cart with an empty one after a failed restore
    if (restoreFailed.current && cartItems.length === 0) return;
    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cartItems.map(({ id, qty }) => ({ id, qty }))),
      );
    } catch {
      // ignore storage errors (private browsing, quota...)
    }
  }, [cartItems, ready]);

  const addToCart = (p: Product, qty = 1) => {
    if (!p.inStock) return;
    setCartItems((prev) =>
      prev.some((i) => i.id === p.id)
        ? prev.map((i) =>
            i.id === p.id ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i,
          )
        : [...prev, { ...p, qty: Math.min(MAX_QTY, qty) }],
    );
  };

  const setQty = (id: number, delta: number) =>
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, qty: Math.min(MAX_QTY, Math.max(1, i.qty + delta)) }
          : i,
      ),
    );

  const remove = (id: number) =>
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCartItems([]);

  const subtotal = round2(cartItems.reduce((s, i) => s + i.price * i.qty, 0));
  const deliveryFee =
    cartItems.length === 0
      ? 0
      : (deliveryOptions.find((o) => o.id === deliveryMethod)?.fee ?? 0);
  const total = round2(subtotal + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        ready,
        cartItems,
        cartCount: cartItems.reduce((n, i) => n + i.qty, 0),
        addToCart,
        setQty,
        remove,
        clearCart,
        subtotal,
        deliveryMethod,
        setDeliveryMethod,
        deliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
