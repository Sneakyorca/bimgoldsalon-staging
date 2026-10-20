export type Testimonial = {
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
};

/** Replace this with the salon's own Google Maps reviews link when you have it */
export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=BIM-GOLD+Hair+and+Beauty+Salon%2C+3+Market+Walk%2C+Huddersfield+HD1+2QA";

// Real Google reviews. Add or edit entries here.
export const testimonials: Testimonial[] = [
  {
    name: "Maya L-s",
    rating: 5,
    text: "I went to Bim Gold to get my hair braided, and I had a great experience. The staff were lovely and made me feel comfortable throughout my appointment. My hair was braided quickly and the finished braids were incredibly neat. I'm really happy with the result and would definitely recommend Bim Gold.",
  },
  {
    name: "Yves",
    rating: 5,
    text: "Bim did an amazing job with my box braids, they are so beautiful and neat! I love them, and have received so many compliments",
  },
  {
    name: "Bolu Debby",
    rating: 5,
    text: "Very professional good at what they do, any hairstyle is done well while you are also comfortable.",
  },
  {
    name: "Itunu Adeniji",
    rating: 4,
    text: "The Word is magic, just book and let her perform magic with your hair, clean, neat, beautiful and fast is the word.",
  },
];
