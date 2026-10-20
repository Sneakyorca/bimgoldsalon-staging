import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { getSettings } from "@/Data/settings";
import { hoursSummary } from "@/lib/hours";
import LocalBusinessJsonLd from "@/components/site/LocalBusinessJsonLd";

export const metadata: Metadata = {
  title: "About",
  description:
    "Your friendly hair and beauty salon at 3 Market Walk in the heart of Huddersfield.",
};

const photos = [
  {
    src: "/images/about-1.jpg",
    alt: "Shampoo basins and black chairs in the BIM-GOLD salon",
  },
  {
    src: "/images/about-2.jpg",
    alt: "A styling chair and lit mirror in the BIM-GOLD salon",
  },
  {
    src: "/images/about-3.jpg",
    alt: "Another view of the BIM-GOLD salon",
  },
];

export default async function AboutPage() {
  const { openingHours } = await getSettings();
  const hours = hoursSummary(openingHours);

  return (
    <main className="mx-auto w-full max-w-360 px-5 pb-16 pt-8 lg:px-12 lg:pt-12">
      <LocalBusinessJsonLd />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="text-[18px] font-medium uppercase leading-relaxed tracking-[0.3em] md:text-[24px]">
            About BIM-GOLD
            <br />
            <span className="normal-case">Hair &amp; Beauty Salon</span>
          </p>
          <h1 className="mt-8 text-[44px] font-bold leading-[1.2] md:text-[64px]">
            Welcome to
            <br />
            BIM-GOLD
          </h1>
          <p className="mt-8 max-w-xl text-[18px] font-bold leading-snug text-black/70 md:text-[20px]">
            We&apos;ll keep it short and simple because we believe in quality
            over quantity.
          </p>
          <p className="mt-6 text-[18px]">We&apos;d love to welcome you in:</p>
          <ul className="mt-4 space-y-2 text-[18px]">
            {hours.map((h) => (
              <li key={h.days} className="flex gap-3">
                <span aria-hidden="true">•</span>
                <span>
                  {h.days}: {h.time}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[18px]">
            Come in, relax, and leave feeling fabulous!
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="space-y-6 text-[18px] leading-relaxed">
            <p>About Bim-Gold Hair and Beauty Salon</p>
            <p>
              Welcome to Bim-Gold, your friendly hair and beauty salon at 3
              Market Walk in the heart of Huddersfield. 💛
            </p>
            <p>
              Our team is passionate about helping you look and feel your best.
              We take the time to listen, offer honest advice, and deliver
              results you&apos;ll love, whether you&apos;re booking a fresh new
              style or keeping up your regular routine.
            </p>
            <p>
              We care for all hair types, including natural and relaxed hair,
              and we stock the right products to keep your hair healthy between
              visits. Our clean, calm salon is a place to unwind, and many of
              our clients say it feels like a home away from home.
            </p>
          </div>
          <Link
            href="/booking"
            className="mt-8 inline-block rounded-full bg-primary px-5 py-2.5 text-[16px] font-semibold text-white transition hover:opacity-90 hover:shadow-md"
          >
            Book Your Session
          </Link>
        </Reveal>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 lg:mt-16">
        {photos.map((p, i) => (
          <li key={p.src}>
            <Reveal delay={i * 100}>
              <div className="relative aspect-[7/6] overflow-hidden rounded-3xl bg-card">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </main>
  );
}
