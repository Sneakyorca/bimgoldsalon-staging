import { z } from "zod";
import { MAX_GALLERY_IMAGES, MAX_IMAGE_CHARS } from "./constants";
const text = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} is too long.`);
const image = z
  .string()
  .max(MAX_IMAGE_CHARS, "An image is too large.")
  .regex(
    /^(|data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+|\/[^\s]*|https:\/\/[^\s]+)$/,
    "That image type isn't allowed.",
  );
const extraInfo = z
  .record(z.string().trim().min(1).max(40), z.string().max(200))
  .refine(
    (record) => Object.keys(record).length <= 20,
    "Too many additional details.",
  )
  .default({});
const shared = {
  name: text("Name", 80),
  category: text("Category", 60),
  image,
  images: z.array(image).max(MAX_GALLERY_IMAGES),
  extraInfo,
};
export const productSchema = z.object({
  ...shared,
  price: z.number().min(0).max(100000),
  stock: z.number().int().min(0).max(100000),
  color: z.string().trim().max(40),
});
export const serviceSchema = z.object({
  ...shared,
  price: z.number().min(0).max(100000),
  durationMin: z.number().int().min(5).max(720),
});
const isRealDate = (date: string) => {
  const time = Date.parse(`${date}T00:00:00Z`);
  return (
    !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === date
  );
};
export const blockDateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(isRealDate, "That isn't a real date."),
  reason: z.string().trim().max(120),
});
export function formatIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the details and try again.";
}
