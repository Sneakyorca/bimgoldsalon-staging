"use client";
import { MapPin } from "lucide-react";
import { useState } from "react";

const MAP_SRC =
  "https://www.google.com/maps?q=3+Market+Walk,+Huddersfield+HD1+2QA,+United+Kingdom&output=embed";

const Map = () => {
  const [loadMap, setLoadMap] = useState(false);
  const address = "3 Market Walk, Huddersfield HD1 2QA, United Kingdom";
  return (
    <section className="mt-16 lg:mt-24 mb-16 h-[279px] md:h-[431px] w-full overflow-hidden">
      {loadMap ? (
        <iframe
          title="BIM - Gold location"
          src={MAP_SRC}
          loading="lazy"
          className="h-[279px] md:h-[431px] w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoadMap(true)}
          className="group flex h-full w-full flex-col items-center justify-center gap-2 bg-[#e9e6e3] text-ink transition hover:bg-[#e0ddda]"
        >
          <MapPin className="h-8 w-8 text-brand" />
          <span className="text-sm font-medium">{address}</span>
          <span className="text-[12px] text-ink/60 underline group-hover:text-ink">
            Tap to load map
          </span>
        </button>
      )}
    </section>
  );
};

export default Map;

function MapStrip() {
  const [loadMap, setLoadMap] = useState(false);
  const address = "225 Newgate Street, Bishop Auckland, DL14 7EL";

  return (
    <section
      aria-label="Find us"
      className="h-[279px] md:h-[431px] w-full overflow-hidden"
    >
      {loadMap ? (
        <iframe
          title="AFROHAIR Empire location"
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          className="h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoadMap(true)}
          className="group flex h-full w-full flex-col items-center justify-center gap-2 bg-[#e9e6e3] text-ink transition hover:bg-[#e0ddda]"
        >
          <MapPin className="h-8 w-8 text-brand" />
          <span className="text-sm font-medium">{address}</span>
          <span className="text-[12px] text-ink/60 underline group-hover:text-ink">
            Tap to load map
          </span>
        </button>
      )}
    </section>
  );
}
