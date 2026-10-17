"use client";
import { Menu } from "lucide-react";
import Logo from "./Logo";
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
import { navLinks } from "./nav-links";

type MobileSideBarProps = { className?: string };

const MobileSideBar = ({ className }: MobileSideBarProps) => {
  return (
    <div className={className}>
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-6" />
            </Button>
          }
        />

        <SheetContent
          className="w-screen! max-w-none! px-5 pt-12 pb-4 md:px-6 md:py-6 lg:px-12"
          side="left"
        >
          <SheetHeader className="p-0">
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-8 pt-6 text-2xl">
            {navLinks.map((l) => (
              <SheetClose
                key={l.href}
                nativeButton={false}
                render={<Link href={l.href} />}
              >
                {l.label}
              </SheetClose>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSideBar;
