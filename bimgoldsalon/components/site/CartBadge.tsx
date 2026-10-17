"use client";

import { useState } from "react";

type Props = {
  count: number;
  /** position, size and text size, e.g. "absolute -right-2 -top-2 h-5 min-w-5 text-[11px]" */
  className?: string;
};

const CartBadge = ({ count, className = "" }: Props) => {
  const open = count > 0;

  // Keep showing the last real number while the badge animates out
  const [shown, setShown] = useState(count);
  if (open && count !== shown) setShown(count);

  return (
    <span
      aria-hidden="true"
      data-open={open}
      className={`cart-badge pointer-events-none inline-block ${className}`}
    >
      <span className="cart-badge-inner grid size-full place-items-center rounded-full px-1 font-medium leading-none text-white">
        {shown > 99 ? "99+" : shown}
      </span>
    </span>
  );
};

export default CartBadge;
