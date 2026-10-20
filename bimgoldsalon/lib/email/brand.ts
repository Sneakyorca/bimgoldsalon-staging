export const BRAND = {
  name: "BIM-GOLD Hair & Beauty Salon",
  address: "3 Market Walk, Huddersfield HD1 2QA, United Kingdom",
  phone: "+44 7353 244480",
  hours: "Monday – Saturday, 9:00 am – 7:30 pm",
  color: "#313c6b",
};

export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
