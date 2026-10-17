/** Placeholder until each service gets its own photo. Files live in /public/images */
const GALLERY_1 = "/images/gallery-1.jpg";

export const serviceTabs = [
  "All",
  "Treatment",
  "Natural Hair Styling",
  "Braids & Twists",
  "Barbering",
] as const;
export type ServiceTab = (typeof serviceTabs)[number];
export type ServiceCategory = Exclude<ServiceTab, "All">;

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  /** path under /public, e.g. "/images/gallery1.jpg" */
  image: string;
  /** used by the homepage service cards */
  featured?: boolean;
  /** used for slot maths and the "1 hr, 30 min duration" line */
  durationMin: number;
  /** shown on the card ("1hr - 2hr") */
  durationLabel: string;
  fromPrice: number;
  details: [label: string, text: string][];
};

export const services: Service[] = [
  {
    id: "mens-grooming",
    name: "Men's Grooming",
    category: "Barbering",
    image: GALLERY_1,
    featured: true,
    durationMin: 90,
    durationLabel: "1hr - 2hr",
    fromPrice: 10,
    details: [
      ["Haircuts", "Fades, low cuts, buzz cuts, and creative styles."],
      [
        "Beard Care",
        "Beard trimming, shaping, shaving, and conditioning treatments.",
      ],
      [
        "Scalp Care",
        "Quick wash, scalp massages, and anti-dandruff treatments.",
      ],
    ],
  },
  {
    id: "deep-conditioning",
    name: "Deep Conditioning Treatment",
    category: "Treatment",
    image: GALLERY_1,
    featured: true,
    durationMin: 60,
    durationLabel: "45min - 1hr",
    fromPrice: 25,
    details: [
      [
        "Treatment",
        "Moisture-rich deep conditioning with steam to restore softness and shine.",
      ],
      ["Includes", "Shampoo, scalp massage, conditioning mask and blow-dry."],
    ],
  },
  {
    id: "scalp-treatment",
    name: "Scalp Treatment",
    category: "Treatment",
    image: GALLERY_1,
    durationMin: 45,
    durationLabel: "30min - 45min",
    fromPrice: 20,
    details: [
      [
        "Scalp Care",
        "Cleansing scrub, massage and soothing treatment for a healthy scalp.",
      ],
    ],
  },
  {
    id: "silk-press",
    name: "Silk Press",
    category: "Natural Hair Styling",
    image: GALLERY_1,
    featured: true,
    durationMin: 120,
    durationLabel: "1hr 30 - 2hr 30",
    fromPrice: 45,
    details: [
      [
        "Styling",
        "Smooth, sleek straightening that keeps your natural texture healthy.",
      ],
      ["Includes", "Wash, treatment, blow-dry and press."],
    ],
  },
  {
    id: "wash-and-style",
    name: "Wash & Style",
    category: "Natural Hair Styling",
    image: GALLERY_1,
    durationMin: 90,
    durationLabel: "1hr - 1hr 30",
    fromPrice: 30,
    details: [
      [
        "Styling",
        "Wash, condition and a style of your choice, from twist-outs to blowouts.",
      ],
    ],
  },
  {
    id: "twist-out",
    name: "Twist Out",
    category: "Natural Hair Styling",
    image: GALLERY_1,
    durationMin: 120,
    durationLabel: "1hr 30 - 2hr",
    fromPrice: 40,
    details: [
      [
        "Styling",
        "Defined, long-lasting twist-out with a moisturising finish.",
      ],
    ],
  },
  {
    id: "knotless-braids",
    name: "Knotless Braids",
    category: "Braids & Twists",
    image: GALLERY_1,
    durationMin: 240,
    durationLabel: "3hr - 5hr",
    fromPrice: 90,
    details: [
      [
        "Braiding",
        "Lightweight, tension-free knotless braids in your choice of length and size.",
      ],
    ],
  },
  {
    id: "box-braids",
    name: "Box Braids",
    category: "Braids & Twists",
    image: GALLERY_1,
    durationMin: 240,
    durationLabel: "3hr - 5hr",
    fromPrice: 80,
    details: [
      [
        "Braiding",
        "Classic box braids, neatly parted and finished with a seal.",
      ],
    ],
  },
  {
    id: "fade-cut",
    name: "Fade & Line-up",
    category: "Barbering",
    image: GALLERY_1,
    durationMin: 45,
    durationLabel: "30min - 45min",
    fromPrice: 15,
    details: [
      ["Haircuts", "Skin, low, mid or high fade with a crisp line-up."],
    ],
  },
];

export const venue = {
  name: "BIM - GOLD Beauty Place, UK",
  rating: 4.7,
  location: "Huddersfield",
  image: "/logo.png",
};

/** Opening hours by weekday (0 = Sunday), in minutes from midnight. null = closed. */
export const openingHours: Record<
  number,
  { open: number; close: number } | null
> = {
  0: null,
  1: { open: 9 * 60, close: 19 * 60 + 30 },
  2: { open: 9 * 60, close: 19 * 60 + 30 },
  3: { open: 9 * 60, close: 19 * 60 + 30 },
  4: { open: 9 * 60, close: 19 * 60 + 30 },
  5: { open: 9 * 60, close: 19 * 60 + 30 },
  6: { open: 9 * 60, close: 19 * 60 + 30 },
};

export const SLOT_STEP = 30; // minutes between start times
export const MIN_LEAD_MIN = 60; // can't book a slot starting within the next hour
export const BOOKING_WINDOW_DAYS = 30; // how many days ahead can be booked

export const policy = {
  cancellation: "Please cancel at least 24 hours before appointment.",
  important: {
    heading: "SALON POLICY",
    intro:
      "To ensure a smooth and comfortable experience for everyone, Thank you for choosing BIM-GOLD HAIR & BEAUTY SALON.",
    lead: "please read and follow our salon policies:",
    sections: [
      {
        title: "1. Appointments",
        points: [
          "Please arrive on time for your appointment.",
          "Please inform us as soon as possible if you need to reschedule.",
        ],
      },
      {
        title: "2. Children & Extra Guests",
        points: [
          "Please come alone unless the accompanying person also has an appointment.",
          "Children’s hair appointments are available for ages 5–10 years.",
          "Please do not bring children who do not have an appointment.",
        ],
      },
      {
        title: "3. Hair Preparation",
        points: [
          "Please come with your hair properly detangled and ready for your chosen service.",
          "Any additional preparation required may attract an extra charge.",
        ],
      },
      {
        title: "4. Extensions",
        points: [
          "Hair extensions are not included in our service prices.",
          "Extensions are available to purchase at the salon.",
        ],
      },
      {
        title: "5. Deposits & Payments",
        points: [
          "A deposit will be required to secure your appointment.",
          "Deposits are non-refundable.",
          "Full payment is required upon completion of your service.",
        ],
      },
      {
        title: "6. Changes & Cancellations",
        points: [
          "Please give us adequate notice if you need to cancel or reschedule.",
          "Repeated cancellations or no-shows may require full payment before future bookings.",
        ],
      },
      {
        title: "7. Photography & Social Media",
        points: [
          "We may take photos or short videos of hairstyles/services for our social media and marketing purposes.",
          "If you do not wish to be photographed or featured on our social media, please let us know before or during your appointment.",
          "We will respect your preference.",
        ],
      },
    ],
    closing: "We appreciate your understanding and continued support!",
  },
};
