"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Phase = "idle" | "hidden" | "shown";

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** milliseconds, for staggering a row of items */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // already on screen when the page opens: leave it alone
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setPhase("hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const state =
    phase === "hidden" ? "reveal-out" : phase === "shown" ? "reveal-in" : "";

  return (
    <div
      ref={ref}
      className={`${state} ${className}`}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
