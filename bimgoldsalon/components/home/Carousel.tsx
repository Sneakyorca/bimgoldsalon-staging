"use client";

import { Children, useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

type Props = {
  children: ReactNode;
  itemClass: string;
  align?: "center" | "end";
  autoplay?: boolean;
  arrowControls?: boolean;
  loop?: boolean;
};

const arrow =
  "grid size-8 place-items-center rounded-full bg-primary text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const Carousel = ({
  children,
  itemClass,
  align = "center",
  arrowControls,
  autoplay,
  loop = false,
}: Props) => {
  const [viewportRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop,
      containScroll: loop ? false : "trimSnaps",
    },
    autoplay
      ? [
          Autoplay({
            delay: 3000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]
      : [],
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const updateButtons = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);

    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi]);

  return (
    <div>
      <div ref={viewportRef} className="overflow-hidden">
        <div className="-ml-4 flex">
          {Children.map(children, (child) => (
            <div className={`min-w-0 shrink-0 pl-4 ${itemClass}`}>{child}</div>
          ))}
        </div>
      </div>

      {arrowControls && (
        <div
          className={`mt-5 flex gap-4 ${
            align === "center" ? "justify-center" : "justify-end"
          }`}
        >
          <button
            type="button"
            className={arrow}
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Previous slide"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            className={arrow}
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Next slide"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Carousel;
