// Check the car park name with the owner. It came from a Google summary, and Wilko's shops closed in 2023.
export const parking = {
  name: "Wilko car park",
  postcode: "HD1 2TW",
  note: "It's next to Alfred Street car park (HD1 2TT).",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=HD1+2TW",
};

export const welcome = {
  title: "Welcome to BIM-GOLD",
  intro:
    "Choose your services, pick a time and secure it with a small deposit. A few things worth knowing before you start:",
  notes: [
    {
      icon: "guest",
      title: "No extra guests",
      text: "Please come on your own, unless the person with you also has an appointment. We can't accommodate extra guests.",
    },
    {
      icon: "team",
      title: "More than one stylist",
      text: "Longer braiding styles (usually 3 hours or more) can be done by two stylists so we finish on time. Everyone on our team is fully qualified, so the quality is the same whoever you sit with.",
    },
    {
      icon: "deposit",
      title: "Deposit",
      text: "A deposit secures your time and is paid when you book. It's non-refundable, and you pay the rest at the salon.",
    },
  ],
};
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
      {
        title: "8. General Notice",
        points: [
          "Longer braiding styles (usually 3 hours or more) may be done by more than one stylist so we can finish on time.",
          "Everyone on our team is fully qualified, and you can expect the same quality of work whoever does your hair.",
        ],
      },
    ],
    closing: "We appreciate your understanding and continued support!",
  },
};
