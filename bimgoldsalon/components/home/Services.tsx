import Image from "next/image";
import Link from "next/link";
import Carousel from "./Carousel";
import SectionTitle from "./SectionTitle";
import { services } from "@/dummydata/serviceData";

type Service = (typeof services)[number];

const MOBILE_LIMIT = 4;

const ServiceCard = ({ title, image, lines }: Service) => (
  <Link
    href="/booking"
    aria-label={`Book ${title}`}
    className="group block h-full"
  >
    <article className="h-full overflow-hidden rounded-lg bg-card transition group-hover:-translate-y-1 group-hover:shadow-md">
      <Image
        src={image}
        alt={title}
        width={400}
        height={260}
        className="h-64 w-full object-cover md:h-52"
      />
      <div className="px-4 py-5">
        <h3 className="text-[20px] font-semibold md:text-center md:text-[16px]">
          {title}
        </h3>
        <div className="mt-2 space-y-1 text-[16px] md:text-center md:text-[10px] md:leading-snug">
          {lines.map(([label, text]) => (
            <p key={label}>
              <span className="font-semibold">{label}</span> {text}
            </p>
          ))}
        </div>
      </div>
    </article>
  </Link>
);

const Services = () => (
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
          <ServiceCard key={s.title} {...s} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/services"
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
          <ServiceCard key={s.title} {...s} />
        ))}
      </Carousel>
    </div>
  </section>
);

export default Services;
