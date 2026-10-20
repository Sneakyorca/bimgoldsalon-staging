"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

export default function ClearAfterPayment({
  kind,
}: {
  kind: "order" | "booking";
}) {
  const { clearCart } = useCart();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (kind === "order") clearCart();
    else {
      try {
        sessionStorage.removeItem("bimgold_booking_v2");
      } catch {
        // ignore storage errors
      }
    }
  }, [kind, clearCart]);

  return null;
}
