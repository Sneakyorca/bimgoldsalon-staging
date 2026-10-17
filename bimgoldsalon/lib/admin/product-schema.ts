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

export const productInputSchema = z.object({
  name: text("Name", 200),
  description: z.string().trim().max(2000, "Description is too long."),
  category: text("Category", 60),
  price: z.number().min(0).max(100000),
  discountPercent: z
    .number()
    .min(0, "Discount can't be negative.")
    .max(95, "Discount can't be more than 95%."),
  stock: z.number().int().min(0).max(100000),
  color: z.string().trim().max(40),
  image: imageUrl,
  images: z.array(imageUrl).max(6),
  extraInfo: z
    .record(z.string().trim().min(1).max(40), z.string().max(200))
    .refine(
      (record) => Object.keys(record).length <= 20,
      "Too many additional details.",
    )
    .default({}),
});
