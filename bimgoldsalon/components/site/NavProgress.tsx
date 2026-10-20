"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "loading" | "done";

/** Thin bar at the top of the page while moving between pages. Ignores clicks on buttons inside links (like "add to cart"). */
export default function NavProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const wasLoading = useRef(false);
  wasLoading.current = phase === "loading";

  // The new page has arrived: finish the bar, then hide it
  useEffect(() => {
    if (wasLoading.current) setPhase("done");
  }, [pathname]);
  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => setPhase("idle"), 300);
    return () => clearTimeout(t);
  }, [phase]);

  // Safety net: never leave the bar hanging
  useEffect(() => {
    if (phase !== "loading") return;
    const t = setTimeout(() => setPhase("idle"), 10000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const target = e.target as Element | null;
      if (
        target?.closest(
          "button, input, select, textarea, label, [data-no-progress]",
        )
      )
        return;
      const a = target?.closest("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download"))
        return;
      const url = new URL(a.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      setPhase("loading");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-100 h-0.75"
    >
      <div
        className="h-full bg-primary"
        style={{
          width: phase === "loading" ? "85%" : phase === "done" ? "100%" : "0%",
          opacity: phase === "idle" ? 0 : 1,
          transition:
            phase === "loading"
              ? "width 8s cubic-bezier(0.1, 0.7, 0.1, 1)"
              : phase === "done"
                ? "width 150ms ease-out"
                : "none",
        }}
      />
    </div>
  );
}
