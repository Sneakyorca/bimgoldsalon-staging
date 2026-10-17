import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import SocialLinks from "@/components/home/Social-Links";
import { BUSINESS } from "@/lib/business";

const FooterCol = ({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) => (
  <div>
    <h3 className="text-[16px] md:text-[14px] lg:text-[16px] font-semibold uppercase">
      {title}
    </h3>
    <ul className="mt-4 space-y-4 text-[16px] md:text-[14px] lg:text-[16px]">
      {links.map(([label, href]) => (
        <li key={href}>
          <Link href={href} className="hover:underline">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer className="bg-primary text-white">
    <div className="mx-auto grid w-full max-w-360 gap-8 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr] md:gap-6 md:px-8 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-10 lg:px-12">
      <div>
        <h2 className="lg:max-w-65 text-[22px] font-semibold leading-[168%] md:text-[22px] md:leading-[150%] lg:text-[30px] lg:leading-[168%]">
          BIM - GOLD Beauty Place
        </h2>
        <div className="mt-3 h-px w-72 md:w-48 bg-white/60" />
        <p className="mt-6 text-[16px] font-medium uppercase md:text-[14px] lg:text-[16px]">
          Opening Hours:
        </p>
        <p className="mt-6 text-[16px] md:mt-4 md:text-[14px] lg:mt-6 lg:text-[16px]">
          <span className="font-semibold">Mon - Sat:</span> 9:00 am – 7:30 pm
        </p>
        <p className="mt-2 text-[16px] md:text-[14px] lg:text-[16px]">
          <span className="font-semibold">Sun:</span> Closed
        </p>
        <Link
          href="tel:+447353244480"
          className="mt-5 flex items-center gap-3 text-[16px] md:text-[14px] lg:text-[16px]"
        >
          <Phone className="size-4 shrink-0" /> +44 7353 244480
        </Link>
        <p className="mt-3 flex items-start gap-3 text-[16px] md:text-[14px] lg:text-[16px]">
          <MapPin className="mt-0.5 size-4 shrink-0" />3 Market Walk,
          Huddersfield HD1 2QA, United Kingdom
        </p>
        <SocialLinks className="mt-6 [&_a]:bg-white hidden md:flex" />
      </div>

      <FooterCol
        title="Information"
        links={[
          ["Service Menu", "/booking"],
          ["Terms & Conditions", "/terms"],
          ["Privacy Policy", "/privacy"],
        ]}
      />
      <FooterCol
        title="Useful Links"
        links={[
          ["Shop", "/product"],
          ["Training", "/training"],
          ["Book Appointment", "/booking"],
        ]}
      />
      <div className="mt-1 h-px w-72 md:hidden bg-white/60" />
      <SocialLinks className="mt-1 [&_a]:bg-white flex md:hidden" />
    </div>

    <div className="border-t border-white/20">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-3 px-5 py-5 text-[14px] md:flex-row md:items-center md:justify-between md:px-8 lg:px-12">
        <p>
          © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
        </p>
        <nav aria-label="Legal" className="flex gap-5">
          <Link href="/terms" className="hover:underline">
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </div>
  </footer>
);

export default Footer;
