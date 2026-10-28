import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import Carousel from "./Carousel";

const gallery = [1, 2, 3, 4].map((n) => `/images/gallery-${n}.jpg`);

const About = () => (
  <section className="mx-auto w-full max-w-360 px-5 pt-16 lg:px-12 lg:pt-16">
    <div className="grid gap-5 lg:grid-cols-2 lg:gap-10">
      <Reveal>
        <h2 className="text-2xl font-semibold leading-snug lg:text-4xl">
          Your Beauty,
          <br />
          <span className="text-primary">Our Passion</span>
        </h2>
        <div className="mt-0 h-0.5 w-10 bg-primary" />
      </Reveal>
      <Reveal delay={100} className="lg:max-w-md">
        <p className="text-[16px] leading-relaxed">
          At BIM - GOLD HAIR &amp; BEAUTY SALON, we believe beauty is more than
          just appearance, it is confidence, self-care, and feeling your best
          everyday. Our expert team is here to bring out the most radiant
          version of you.
        </p>
        <Link
          href="/about"
          className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-[16px] font-semibold text-white transition hover:opacity-90 hover:shadow-md"
        >
          Learn More
        </Link>
      </Reveal>
    </div>

    <div className="mt-10 lg:mt-14">
      <Reveal>
        <Carousel
          autoplay
          itemClass="basis-[70%] sm:basis-[calc(50%-8px)] md:basis-[calc(37.5%-6px)] lg:basis-[calc(25%-12px)]"
        >
          {gallery.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={`Salon gallery ${i + 1}`}
              width={400}
              height={400}
              loading="eager"
              className="aspect-square w-full rounded-lg object-cover"
            />
          ))}
        </Carousel>
      </Reveal>
    </div>
  </section>
);

export default About;
