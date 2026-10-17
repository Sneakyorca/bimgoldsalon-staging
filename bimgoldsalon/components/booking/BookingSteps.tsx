import { ChevronRight } from "lucide-react";
import Link from "next/link";

const steps = [
  { label: "Services", href: "/booking" },
  { label: "Time", href: "/booking/time" },
  { label: "Confirm", href: "/booking/confirm" },
] as const;

/** Services > Time > Confirm. Earlier steps are links; `locked` turns them all into plain text. */
const BookingSteps = ({
  current,
  locked = false,
}: {
  current: 1 | 2 | 3;
  locked?: boolean;
}) => (
  <nav aria-label="Booking progress">
    <ol className="flex flex-wrap items-center gap-2 text-[16px] md:text-[18px]">
      {steps.map((s, i) => {
        const n = i + 1;
        return (
          <li key={s.label} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="size-5" aria-hidden="true" />}
            {n < current && !locked ? (
              <Link href={s.href} className="text-gray-500 hover:text-black">
                {s.label}
              </Link>
            ) : (
              <span
                aria-current={n === current ? "step" : undefined}
                className={
                  n === current ? "font-semibold text-black" : "text-gray-500"
                }
              >
                {s.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default BookingSteps;
