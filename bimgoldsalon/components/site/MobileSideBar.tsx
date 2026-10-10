"use client";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { navLinks } from "./nav-links";

type MobileSideBarProps = { className?: string };

const MobileSideBar = ({ className }: MobileSideBarProps) => {
  const { ready, cartCount } = useCart();
  // stays 0 until the cart is read from localStorage (avoids a hydration mismatch)
  const count = ready ? cartCount : 0;

  return (
    <div className={className}>
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                count > 0 ? `Open menu, ${count} items in cart` : "Open menu"
              }
              className="relative"
            >
              <Menu className="size-6" />
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Button>
          }
        />

        <SheetContent
          className="w-screen! max-w-none! px-5 pt-12 pb-4 md:px-6 md:py-6 lg:px-12"
          side="left"
        >
          <SheetHeader className="p-0">
            <SheetTitle>
              <Image
                className="h-12.25 w-11.25 md:w-32.25 md:h-18"
                src="/logo.png"
                alt="Bimgold logo"
                width={48}
                height={46}
              />
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-8 pt-6 text-2xl">
            {navLinks.map((l) => (
              <SheetClose key={l.href} render={<Link href={l.href} />}>
                {l.label}
              </SheetClose>
            ))}

            <SheetClose
              render={<Link href="/cart" />}
              className="flex items-center gap-3"
            >
              Cart
              {count > 0 && (
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-red-600 px-1.5 text-[13px] font-bold leading-none text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSideBar;
