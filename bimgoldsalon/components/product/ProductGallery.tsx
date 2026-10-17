"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { NO_IMAGE } from "@/lib/products";

export default function ProductGallery({
  name,
  images,
  children,
}: {
  name: string;
  images: string[];
  /** e.g. the stock badge, drawn over the main image */
  children?: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [NO_IMAGE];

  return (
    <div>
      <div className="relative rounded-2xl bg-card p-6">
        {children}
        <Image
          src={list[active] ?? list[0]}
          alt={name}
          width={520}
          height={520}
          priority
          className="mx-auto h-72 w-auto object-contain md:h-125"
        />
      </div>
      {list.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {list.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
                className={`overflow-hidden rounded-lg border-2 bg-card ${
                  i === active ? "border-primary" : "border-transparent"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  width={72}
                  height={72}
                  className="size-18 object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
