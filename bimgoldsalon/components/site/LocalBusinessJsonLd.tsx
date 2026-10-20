import { getSettings } from "@/Data/settings";
import { SALON, SITE_URL } from "@/lib/seo";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const hhmm = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export default async function LocalBusinessJsonLd() {
  const { openingHours } = await getSettings();

  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: SALON.name,
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    telephone: SALON.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SALON.street,
      addressLocality: SALON.city,
      postalCode: SALON.postcode,
      addressCountry: SALON.country,
    },
    openingHoursSpecification: DAYS.flatMap((dayOfWeek, i) => {
      const h = openingHours[i];
      return h
        ? [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek,
              opens: hhmm(h.open),
              closes: hhmm(h.close),
            },
          ]
        : [];
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
