"use client";

import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { COUNTRIES } from "@/lib/countries";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Limit the list to these ISO codes. Leave out for every country. */
  only?: string[] | null;
};

const CountrySelect = forwardRef<HTMLSelectElement, Props>(
  ({ only, className = "", ...props }, ref) => {
    const list =
      only && only.length > 0
        ? COUNTRIES.filter((c) => only.includes(c.iso))
        : COUNTRIES;
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`${className} appearance-none pr-10`}
          {...props}
        >
          {list.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2"
        />
      </div>
    );
  },
);
CountrySelect.displayName = "CountrySelect";

export default CountrySelect;
