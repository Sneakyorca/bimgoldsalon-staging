import { z } from "zod";
import { isCatalogImageUrl } from "@/lib/products";

const text = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} is too long.`);

const imageUrl = z
  .string()
  .max(2048)
  .refine(
    (u) =>
      u === "" ||
      (u.startsWith("/") && !u.startsWith("//")) ||
      isCatalogImageUrl(u),
    "That image isn't allowed. Upload it with the photo button.",
  );

export const serviceInputSchema = z.object({
  name: text("Name", 120),
  category: text("Category", 60),
  price: z.number().min(0).max(100000),
  priceIsFrom: z.boolean(),
  durationMin: z
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes.")
    .max(720, "Duration can't be more than 12 hours."),
  durationLabel: z.string().trim().max(40, "Duration label is too long."),
  depositPercent: z
    .number()
    .min(0, "Deposit can't be negative.")
    .max(100, "Deposit can't be more than 100%."),
  featured: z.boolean(),
  capacity: z
    .number()
    .int()
    .min(1, "Clients at the same time must be at least 1.")
    .max(20, "Clients at the same time can't be more than 20."),

  image: imageUrl,
  images: z.array(imageUrl).max(6),
  extraInfo: z
    .record(z.string().trim().min(1).max(40), z.string().max(300))
    .refine(
      (record) => Object.keys(record).length <= 20,
      "Too many additional details.",
    )
    .default({}),
});
