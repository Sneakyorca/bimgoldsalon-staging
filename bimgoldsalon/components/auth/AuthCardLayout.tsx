import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  heading: string;
  subheading: string;
  /** Mobile: "Back to <label>" link under the card. Desktop: outlined button in the blue panel. */
  backTo: { label: string; href: string };
  children: ReactNode;
};

/**
 * Same look as /auth: blue header + overlapping card on mobile,
 * form on the left and rounded blue panel on the right on desktop.
 */
const AuthCardLayout = ({ heading, subheading, backTo, children }: Props) => (
  <div className="mx-auto w-full max-w-md md:flex md:min-h-185 md:max-w-none md:overflow-hidden">
    <div className="bg-primary px-6 pb-24 pt-20 text-center text-white md:order-2 md:flex md:w-[40%] md:flex-col md:items-center md:justify-center md:rounded-l-[200px] md:p-12">
      <p className="mx-auto max-w-95 text-[35px] font-semibold leading-tight md:text-[40px]">
        {heading}
      </p>
      <p className="mt-2 text-[18px] font-medium md:mt-4">{subheading}</p>
      <Link
        href={backTo.href}
        className="mt-8 hidden w-50 rounded-xl border border-white px-8 py-2.5 text-center text-[18px] font-semibold transition hover:bg-white hover:text-primary md:block"
      >
        {backTo.label}
      </Link>
    </div>

    <div className="relative -mt-8 rounded-t-[32px] bg-[#f9f9f9] px-5 py-6 shadow-[0_2px_6px_rgba(0,0,0,0.25)] md:order-1 md:mt-0 md:flex md:w-[60%] md:items-center md:justify-center md:rounded-none md:bg-transparent md:px-8 md:py-10 md:pr-[10%] md:shadow-none">
      <div className="w-full md:max-w-[487px]">{children}</div>
    </div>

    <p className="py-4 text-center text-[14px] md:hidden">
      Back to{" "}
      <Link href={backTo.href} className="font-bold">
        {backTo.label}
      </Link>
    </p>
  </div>
);

export default AuthCardLayout;
