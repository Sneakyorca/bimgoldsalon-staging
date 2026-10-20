"use client";

import { Search, X } from "lucide-react";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import type { Product } from "@/lib/products";
import ProductCard from "../site/ProductCard";
import Pagination from "./Pagination";

const PAGE_SIZE = 8;
const ALL = "All Products";

const ShopView = ({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const filters = [ALL, ...categories];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === ALL || p.category === category) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.blurb.toLowerCase().includes(q)),
    );
  }, [products, query, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE,
  );
  const from = (current - 1) * PAGE_SIZE + 1;

  const goTo = (p: number) => {
    setPage(p);
    // the page's scroll padding keeps this clear of the fixed navbar
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearSearch = () => {
    setQuery("");
    setPage(1);
  };

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-360 px-5 pb-16 pt-6 lg:px-12"
    >
      <div className="relative mx-auto max-w-175">
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-gray-600" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && query) clearSearch();
          }}
          placeholder="Search premium products..."
          aria-label="Search products"
          className="h-13 w-full rounded-full border border-black/60 bg-transparent pl-13 pr-12 text-[16px] outline-none focus:ring-2 focus:ring-primary/30 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-gray-600 hover:bg-black/5"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="-mx-5 mt-5 flex gap-3 overflow-x-auto px-5 pb-1 md:mx-0 md:justify-center md:px-0">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={category === f}
            onClick={() => {
              setCategory(f);
              setPage(1);
            }}
            className={`shrink-0 rounded-full border px-5 py-2.5 text-[16px] ${
              category === f
                ? "border-primary bg-primary text-white"
                : "border-black/50 hover:bg-card"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-600">No products match your search.</p>
          {(query || category !== ALL) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory(ALL);
                setPage(1);
              }}
              className="mt-4 rounded-full border border-primary px-6 py-2 text-[14px] font-semibold text-primary hover:bg-card"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p
            aria-live="polite"
            className="mt-5 text-center text-[14px] text-gray-600"
          >
            Showing {from}–{from + visible.length - 1} of {filtered.length}{" "}
            products
          </p>
          <ul className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {visible.map((p, i) => (
              <li
                key={p.id}
                className="fade-up"
                style={{ "--i": i } as CSSProperties}
              >
                <ProductCard product={p} variant="grid" showStatus />
              </li>
            ))}
          </ul>
        </>
      )}

      <Pagination current={current} total={pageCount} onChange={goTo} />
    </section>
  );
};

export default ShopView;
