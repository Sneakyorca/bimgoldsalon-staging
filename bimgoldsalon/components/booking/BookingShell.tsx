import type { ReactNode } from "react";
import BookingSteps from "./BookingSteps";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";

type Props = {
  step: 1 | 2 | 3;
  title: string;
  children: ReactNode;
  /** the summary card: under the content on mobile, sticky on the right from lg */
  summary?: ReactNode;
  locked?: boolean;
  center?: boolean;
};

// Where the back arrow goes from each step
const backHref = {
  1: "/",
  2: "/booking",
  3: "/booking/time",
} as const;

const circleBtn =
  "grid size-8 place-items-center rounded-full border border-black bg-white transition hover:bg-black hover:text-white";

const BookingShell = ({
  step,
  title,
  children,
  summary,
  locked,
  center,
}: Props) => (
  <section className="mx-auto w-full max-w-360 px-5 pb-16 pt-4 lg:px-12">
    {/* Back / close row */}
    <div className="mb-4 flex items-center justify-between">
      {locked ? (
        <span aria-hidden="true" className="size-8" />
      ) : (
        <Link href={backHref[step]} aria-label="Go back" className={circleBtn}>
          <ArrowLeft className="size-4" />
        </Link>
      )}
      <Link href="/" aria-label="Close booking" className={circleBtn}>
        <X className="size-4" />
      </Link>
    </div>
    <BookingSteps current={step} locked={locked} />
    <h1 className="mb-6 mt-5 text-center text-[32px] font-bold leading-tight md:text-[40px]">
      {title}
    </h1>
    <div
      className={`grid grid-cols-1 gap-6 ${
        center
          ? ""
          : "lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10"
      }`}
    >
      <div className={`min-w-0 ${center ? "mx-auto w-full" : ""}`}>
        {children}
      </div>

      {summary && (
        <aside className="min-w-0 lg:sticky lg:top-32">{summary}</aside>
      )}
    </div>
  </section>
);

export default BookingShell;
