export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SALON = {
  name: "BIM-GOLD Hair & Beauty Salon",
  phone: "+447353244480",
  street: "3 Market Walk",
  city: "Huddersfield",
  postcode: "HD1 2QA",
  country: "GB",
};

export const DEFAULT_DESCRIPTION =
  "Looking for braids in Huddersfield? BIM-GOLD offers knotless braids, cornrows, crochet styles and wig installations. Book online or shop hair products at 3 Market Walk.";
