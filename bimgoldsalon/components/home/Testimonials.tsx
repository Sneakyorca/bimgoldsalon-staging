import { ArrowUpRight, Quote, Star } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { GOOGLE_REVIEWS_URL, testimonials } from "@/lib/testimonials";

const Stars = ({ rating }: { rating: number }) => (
  <div
    role="img"
    aria-label={`${rating} out of 5 stars`}
    className="mt-1 flex gap-0.5"
  >
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        aria-hidden="true"
        className={`size-4 ${
          n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
        }`}
      />
    ))}
  </div>
);

const Testimonials = () => (
  <section className="mx-auto w-full max-w-360 px-5 pt-14 lg:px-12 lg:pt-24">
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-semibold leading-snug lg:text-4xl">
          What Our
          <br />
          Customers Say
        </h2>
        <p className="mt-4 text-base leading-relaxed lg:max-w-sm">
          Real words from the people we braided, styled and pampered.
        </p>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline mt-5 inline-flex items-center gap-1 text-[15px] font-semibold text-primary"
        >
          Read more reviews on Google
          <ArrowUpRight className="size-4" />
        </a>
      </div>

      <ul className="flex flex-col gap-5">
        {testimonials.map((t, i) => (
          <li key={t.name} className={i % 2 === 0 ? "lg:ml-24" : "lg:ml-0"}>
            <Reveal delay={i * 80}>
              <figure className="relative max-w-lg rounded-md border border-primary/30 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="rounded-md bg-white p-4 shadow-[10px_0px_1px_0px_#00174BCC_inset]">
                  <Quote className="absolute right-4 top-3 size-4 fill-primary text-primary" />
                  <figcaption className="text-base font-semibold">
                    {t.name}
                  </figcaption>
                  <Stars rating={t.rating} />
                  <blockquote className="mt-2 text-[14px] leading-relaxed">
                    {t.text}
                  </blockquote>
                </div>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Testimonials;
