export const categories = [
  "Wigs & Extension",
  "Chemical & Treatment",
  "Salon Accessories",
] as const;
export type Category = (typeof categories)[number];

export type Product = {
  id: number;
  name: string;
  blurb: string;
  price: number; // number now, so the cart can do maths. Format with formatPrice()
  category: Category;
  inStock: boolean;
  image: string;
};

const templates: Pick<Product, "name" | "blurb" | "price" | "category">[] = [
  {
    name: "Men's Grooming",
    category: "Salon Accessories",
    price: 100,
    blurb:
      "Haircuts: Fades, low cuts, buzz cuts, and creative styles. Beard Care: Beard trimming, shaping, shaving, and conditioning treatments.",
  },
  {
    name: "Lace Front Wig",
    category: "Wigs & Extension",
    price: 100,
    blurb:
      "Natural-looking lace front wig with a soft hairline, ready to style, colour and wear.",
  },
  {
    name: "Relaxer Treatment Kit",
    category: "Chemical & Treatment",
    price: 100,
    blurb:
      "Smoothing relaxer kit with neutralising shampoo and conditioner for salon-quality results.",
  },
];

export const products: Product[] = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  ...templates[i % templates.length],
  inStock: i % 5 !== 2, // every 5th product is out of stock, like the mockup
  image: "/images/product.png",
}));
