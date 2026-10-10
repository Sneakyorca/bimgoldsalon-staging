// import { useEffect, useState } from "react";
// import { CartContext } from "./cartContextDefinition";
// // import { getProducts } from "../services/products";

// const CART_KEY = "cart_items";
// const FREE_DELIVERY_THRESHOLD = 50;
// const FLAT_DELIVERY_FEE = 4.99;

// function loadCart() {
//   try {
//     const raw = localStorage.getItem(CART_KEY);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// }

// export function CartProvider({ children }) {
//   // Product grid data
//   const [products, setProducts] = useState([]);
//   useEffect(() => {
//     async function loadProducts() {
//       const data = await getProducts();
//       setProducts(data);
//     }
//     loadProducts();
//   }, []);

//   // Cart state — hydrated from localStorage on first render
//   const [cartItems, setCartItems] = useState(loadCart);

//   // Persist on every change
//   useEffect(() => {
//     try {
//       localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
//     } catch {
//       // ignore storage errors (private browsing, quota, etc.)
//     }
//   }, [cartItems]);

//   // Add product to cart
//   const handleClick = (p) => {
//     setCartItems((prevItems) => {
//       const exists = prevItems.some((c) => c.id === p.id);
//       if (!exists) {
//         const qty = typeof p.qty === "number" ? p.qty : Number(p.qty) || 1;
//         return [...prevItems, { ...p, qty }];
//       }
//       return prevItems.map((it) =>
//         it.id === p.id ? { ...it, qty: Math.max(1, it.qty + 1) } : it,
//       );
//     });
//   };

//   const [productsLoading, setProductsLoading] = useState(true);
//   useEffect(() => {
//     async function loadProducts() {
//       const data = await getProducts();
//       setProducts(data);
//       setProductsLoading(false);
//     }
//     loadProducts();
//   }, []);

//   // Update quantity
//   const setQty = (id, edit) =>
//     setCartItems((prevItems) =>
//       prevItems.map((it) =>
//         it.id === id ? { ...it, qty: Math.max(1, (it.qty ?? 0) + edit) } : it,
//       ),
//     );

//   // Remove from cart
//   const remove = (id) =>
//     setCartItems((prevItems) => prevItems.filter((it) => it.id !== id));
//   const clearCart = () => setCartItems([]);

//   // Calculate totals
//   const subtotal = cartItems.reduce(
//     (s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0),
//     0,
//   );
//   const cartCount = cartItems.length;

//   // Delivery rule: free above the threshold, flat fee below it, nothing if cart is empty
//   const delivery =
//     cartItems.length === 0
//       ? 0
//       : subtotal >= FREE_DELIVERY_THRESHOLD
//         ? 0
//         : FLAT_DELIVERY_FEE;

//   const total = subtotal + delivery;

//   return (
//     <CartContext.Provider
//       value={{
//         products,
//         cartItems,
//         setCartItems,
//         handleClick,
//         setQty,
//         remove,
//         subtotal,
//         delivery,
//         total,
//         cartCount,
//         clearCart,
//         freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
//         productsLoading,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/dummydata/productData";
import {
  DEFAULT_DELIVERY,
  deliveryOptions,
  type DeliveryMethodId,
} from "@/dummydata/deliveryData";

export type CartItem = Product & { qty: number };

// v2 stores only { id, qty } and uses its own key, so old data from other projects on the
// same origin (localhost) can never leak in and break the totals
const CART_KEY = "bimgold_cart_v2";
const MAX_QTY = 99;
/** Seeds 4 in-stock items on the first visit so the UI isn't empty. Set to false later. */
const SEED_DEMO_CART = true;

const round2 = (n: number) => Math.round(n * 100) / 100;

type CartContextValue = {
  /** false until the cart has been read from localStorage (avoids a flash of "empty cart") */
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

  // Hydrate from localStorage after mount (reading it during render would break SSR)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const saved: unknown = JSON.parse(raw);
        if (Array.isArray(saved)) {
          // Rebuild from current product data so price/stock are never stale or malformed
          setCartItems(
            saved.flatMap((s) => {
              const product = products.find((p) => p.id === s?.id);
              const qty = Number(s?.qty);
              return product && Number.isInteger(qty) && qty > 0
                ? [{ ...product, qty: Math.min(MAX_QTY, qty) }]
                : [];
            }),
          );
        }
      } else if (SEED_DEMO_CART) {
        setCartItems(
          products
            .filter((p) => p.inStock)
            .slice(0, 4)
            .map((p) => ({ ...p, qty: 1 })),
        );
      }
    } catch {
      // ignore storage errors
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
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
  // Delivery / pickup fee comes from the chosen method. Local pickup is free.
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
        // total units, so +/- changes show in the navbar badge
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
