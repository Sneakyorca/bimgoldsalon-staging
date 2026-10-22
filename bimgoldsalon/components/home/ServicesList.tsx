"use client";

import Image from "next/image";
import Link from "next/link";
import { PRESELECT_KEY } from "@/context/BookingContext";
import { NO_IMAGE } from "@/lib/products";
import type { Service } from "@/lib/services";
import Carousel from "./Carousel";
import SectionTitle from "./SectionTitle";

const MOBILE_LIMIT = 4;

const ServiceCard = ({
  name,
  image,
  id,
  details,
  durationLabel,
  fromPrice,
  isFromPrice,
}: Service) => {
  // The booking page picks this up and ticks the service for you
  const handleClick = () => {
    try {
      sessionStorage.setItem(PRESELECT_KEY, id);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <Link
      href="/booking"
      aria-label={`Book ${name}`}
      onClick={handleClick}
      className="group block h-full"
    >
      <article className="h-full overflow-hidden rounded-lg bg-card transition group-hover:-translate-y-1 group-hover:shadow-md">
        <Image
          src={image}
          alt={name}
          width={400}
          height={260}
          className={`h-64 w-full md:h-52 ${
            image === NO_IMAGE ? "bg-[#f3f1ee] object-contain" : "object-cover"
          }`}
        />
        <div className="p-5">
          <h3 className="text-[20px] font-semibold md:text-center md:text-[16px]">
            {name}
          </h3>
          <p className="mt-1 text-[14px] opacity-70 md:text-center md:text-[10px]">
            {durationLabel} · {isFromPrice ? "from " : ""}£{fromPrice}
          </p>
          <div className="mt-2 space-y-1 text-[16px] md:text-center md:text-[10px] md:leading-snug">
            {details.map(([label, text]) => (
              <p key={label} className="line-clamp-4">
                <span className="font-semibold">{label}:</span> {text}
              </p>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
};

const ServicesList = ({ services }: { services: Service[] }) => (
  <section className="mx-auto w-full max-w-360 px-5 pt-14 lg:px-12 lg:pt-20">
    <SectionTitle
      plain="Explore Our"
      accent="Services"
      className="mb-8 flex flex-col items-center"
    />

    {/* Mobile: stacked list, limited to 4, with View all */}
    <div className="md:hidden">
      <div className="flex flex-col gap-5">
        {services.slice(0, MOBILE_LIMIT).map((s) => (
          <ServiceCard key={s.id} {...s} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/booking"
          className="rounded-full border border-current px-8 py-3 text-[16px] font-semibold transition hover:bg-card"
        >
          View all
        </Link>
      </div>
    </div>

    {/* Tablet/Desktop: carousel */}
    <div className="hidden md:block">
      <Carousel
        loop
        arrowControls
        itemClass="basis-[85%] md:basis-1/2 lg:basis-1/4"
      >
        {services.map((s) => (
          <ServiceCard key={s.id} {...s} />
        ))}
      </Carousel>
    </div>
  </section>
);

export default ServicesList;
