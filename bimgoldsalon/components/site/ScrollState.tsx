"use client";

import { useEffect } from "react";

/** Marks the page as scrolled, so the header can get a stronger shadow */
export default function ScrollState() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () =>
      root.setAttribute("data-scrolled", String(window.scrollY > 8));
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return null;
}
