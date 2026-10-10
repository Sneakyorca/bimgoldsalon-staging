import Link from "next/link";

const steps = [
  { n: 1, label: "Shopping Cart", href: "/cart" },
  { n: 2, label: "Checkout", href: "/checkout" },
  { n: 3, label: "Order received", href: null },
] as const;

const cell =
  "flex w-full items-center justify-center gap-3 whitespace-nowrap px-8 py-5 md:py-8";

const CheckoutSteps = ({ current }: { current: 1 | 2 | 3 }) => (
  <nav
    aria-label="Checkout progress"
    className="overflow-x-auto rounded-lg border border-black/40"
  >
    <ol className="flex min-w-max md:min-w-0">
      {steps.map((s, i) => {
        const reached = s.n <= current;
        const content = (
          <>
            <span
              className={`grid size-7 place-items-center rounded-full text-[14px] font-bold text-white ${
                reached ? "bg-primary" : "bg-gray-400"
              }`}
            >
              {s.n}
            </span>
            <span
              className={`text-[18px] font-semibold ${reached ? "text-black" : "text-gray-400"}`}
            >
              {s.label}
            </span>
          </>
        );
        return (
          <li
            key={s.n}
            aria-current={s.n === current ? "step" : undefined}
            className={`flex flex-1 ${i > 0 ? "border-l-2 border-black/70" : ""}`}
          >
            {s.href && reached ? (
              <Link href={s.href} className={cell}>
                {content}
              </Link>
            ) : (
              <div className={cell}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default CheckoutSteps;
