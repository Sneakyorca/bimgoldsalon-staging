import { Quote } from "lucide-react";

const reviews = [
  { name: "Men's Grooming", offset: "lg:ml-24" },
  { name: "Men's Grooming", offset: "lg:ml-0" },
  { name: "Men's Grooming", offset: "lg:ml-24" },
];

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
          <span className="lg:hidden">
            Real words from the people we styled, trimmed and pampered.
          </span>
          <span className="hidden lg:inline">
            Replace this with a short line about your client feedback.
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {reviews.map((r, i) => (
          <figure
            key={i}
            className={`relative max-w-md rounded-md border border-primary/30  ${r.offset}`}
          >
            <div className="rounded-md bg-white shadow-[10px_0px_1px_0px_#00174BCC_inset] p-4">
              <Quote className="absolute right-4 top-3 size-4 fill-primary text-primary" />
              <figcaption className="text-base font-semibold">
                {r.name}
              </figcaption>
              <blockquote className="mt-1 text-[10px] max-w-65 leading-snug">
                Haircuts: Fades, low cuts, buzz cuts, and creative styles.
                <br />
                Beard Care: Beard trimming, shaping, shaving, and conditioning
                treatments.
              </blockquote>
            </div>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
