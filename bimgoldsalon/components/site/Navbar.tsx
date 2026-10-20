import Logo from "./Logo";
import Link from "next/link";
import { User } from "lucide-react";
import CartMenu from "./CartMenu";
import MobileSideBar from "./MobileSideBar";
import { navLinks } from "./nav-links";
import NavLink from "./NavLink";

const outlined =
  "rounded-md bg-primary px-3 py-2 text-[12px] font-semibold uppercase whitespace-nowrap text-white transition hover:opacity-90 shadow-[3px_3px_1px_0px_#000000] hover:shadow-[0px_0px_0px_0px_#000000] lg:px-5 lg:py-2.5 lg:text-[16px] lg:shadow-[4px_4px_1px_0px_#000000]";

// Header height per breakpoint. The fixed header and the spacer below share it,
// so nothing on the page ever hides underneath the navbar.
const heights = "h-20 md:h-24 lg:h-28";

const Navbar = () => {
  return (
    <>
      <header className="site-header fixed inset-x-0 top-0 z-40 bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
        <nav
          className={`mx-auto flex w-full max-w-360 items-center justify-between gap-3 px-5 md:px-6 lg:gap-4 lg:px-12 ${heights}`}
        >
          <Link href="/" aria-label="Bimgold home" className="shrink-0">
            <Logo priority />
          </Link>

          <ul className="hidden items-center gap-5 text-[14px] font-medium uppercase md:flex lg:gap-10 lg:text-[16px]">
            {navLinks.map((l) => (
              <li key={l.href}>
                <NavLink href={l.href} className="whitespace-nowrap">
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-3 lg:gap-5">
            <Link href="/account" aria-label="Account" className="block">
              <User className="size-5 fill-current lg:size-6.25" />
            </Link>

            <Link href="/booking" className={`${outlined} hidden md:flex`}>
              Book now
            </Link>

            <CartMenu className={outlined} />
            <MobileSideBar className="md:hidden" />
          </div>
        </nav>
      </header>
      <div aria-hidden="true" className={heights} />
    </>
  );
};

export default Navbar;
