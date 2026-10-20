import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  current: number;
  total: number;
  onChange: (page: number) => void;
};

/** 1 2 3 … 6 style page list */
const pageList = (current: number, total: number): (number | "…")[] => {
  const nums = new Set<number>([1, total]);
  for (let p = current - 1; p <= current + 1; p++) nums.add(p);
  if (current <= 3) [2, 3].forEach((p) => nums.add(p));
  const sorted = [...nums]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
};

const Pagination = ({ current, total, onChange }: Props) => {
  if (total <= 1) return null;
  const arrow =
    "grid size-10 place-items-center rounded-full hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-1 md:gap-3"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className={arrow}
      >
        <ChevronLeft className="size-5" />
      </button>
      {pageList(current, total).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-gray-500">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === current ? "page" : undefined}
            className={`grid size-10 place-items-center rounded-full text-[18px] ${
              p === current
                ? "border-2 border-primary font-semibold text-black"
                : "text-gray-500 hover:bg-black/5 hover:text-black"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className={arrow}
      >
        <ChevronRight className="size-5" />
      </button>
    </nav>
  );
};

export default Pagination;
