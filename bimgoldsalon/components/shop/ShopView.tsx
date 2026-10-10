"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { categories, products } from "@/dummydata/productData";
import ProductCard from "../site/ProductCard";
import Pagination from "./Pagination";

const PAGE_SIZE = 8;
const filters = ["All Products", ...categories] as const;
type Filter = (typeof filters)[number];

const ShopView = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Filter>("All Products");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === "All Products" || p.category === category) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.blurb.toLowerCase().includes(q)),
    );
  }, [query, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE,
  );

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="mx-auto w-full max-w-360 px-5 pb-16 pt-6 lg:px-12">
      <div className="relative mx-auto max-w-175">
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-gray-600" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search premium products..."
          aria-label="Search products"
          className="h-13 w-full rounded-full border border-black/60 bg-transparent pl-13 pr-6 text-[16px] outline-none focus:ring-2 focus:ring-primary/30"
        />
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
        <p className="py-20 text-center text-gray-600">
          No products match your search.
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {visible.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} variant="grid" showStatus />
            </li>
          ))}
        </ul>
      )}

      <Pagination current={current} total={pageCount} onChange={goTo} />
    </section>
  );
};

export default ShopView;
