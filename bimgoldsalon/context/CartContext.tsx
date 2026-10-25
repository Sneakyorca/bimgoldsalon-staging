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
  type DeliveryMethodId,
} from "@/lib/delivery-options";
import { createClient } from "@/lib/supabase/client";
import {
  getSavedCartAction,
  syncCartAction,
} from "@/app/cart/reminder-actions";

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
  // ---- Basket reminders: a signed-in customer's basket is also saved on the server ----
  const [signedIn, setSignedIn] = useState(false);
  const [syncReady, setSyncReady] = useState(false);
  const restoreStarted = useRef(false);
  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getSession()
      .then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      if (!session) {
        restoreStarted.current = false;
        lastSynced.current = null;
        setSyncReady(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // On a new device the basket is empty, so fetch the saved one first.
  // Syncing waits for this, so an empty basket can't wipe the saved one.
  useEffect(() => {
    if (!ready || !signedIn || restoreStarted.current) return;
    restoreStarted.current = true;
    if (cartItems.length > 0) {
      setSyncReady(true);
      return;
    }
    getSavedCartAction()
      .then(async (saved) => {
        if (saved.length === 0) return;
        const fresh = await getCartProductsAction(saved.map((l) => l.id));
        const restored: CartItem[] = saved.flatMap((l) => {
          const product = fresh.find((p) => p.id === l.id);
          return product ? [{ ...product, qty: Math.min(MAX_QTY, l.qty) }] : [];
        });
        setCartItems((prev) => (prev.length > 0 ? prev : restored));
      })
      .catch(() => {})
      .finally(() => setSyncReady(true));
  }, [ready, signedIn, cartItems.length]);

  useEffect(() => {
    if (!syncReady || !signedIn) return;
    const lines = cartItems
      .map(({ id, qty }) => ({ id, qty }))
      .sort((a, b) => a.id - b.id);
    const snapshot = JSON.stringify(lines);
    if (snapshot === lastSynced.current) return;
    if (lastSynced.current === null && lines.length === 0) {
      lastSynced.current = snapshot; // nothing to save yet
      return;
    }
    const timer = setTimeout(() => {
      syncCartAction(lines)
        .then((r) => {
          if (r.ok) lastSynced.current = snapshot;
        })
        .catch(() => {});
    }, 4000);
    return () => clearTimeout(timer);
  }, [cartItems, syncReady, signedIn]);
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
