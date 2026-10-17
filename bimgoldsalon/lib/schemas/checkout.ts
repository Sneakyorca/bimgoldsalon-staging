import { z } from "zod";
import { COUNTRIES } from "@/lib/countries";
import { requiredPhone } from "./auth";

const required = (msg: string) => z.string().trim().min(1, msg);

export const UK_POSTCODE = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;

export const checkoutSchema = z
  .object({
    firstName: required("Enter your first name"),
    lastName: required("Enter your last name"),
    country: z
      .string()
      .refine((c) => COUNTRIES.some((x) => x.iso === c), "Choose your country"),
    street: required("Enter your street address"),
    city: required("Enter your town or city"),
    state: z.string().trim().max(80, "County is too long"), // county, optional
    postcode: required("Enter your postcode").max(12, "Postcode is too long"),
    phone: requiredPhone,
    email: required("Enter your email").email("Enter a valid email address"),
    notes: z.string().max(500, "Keep notes under 500 characters"),
    agree: z
      .boolean()
      .refine((v) => v === true, {
        message: "Please accept the terms to continue",
      }),
  })
  .superRefine((d, ctx) => {
    if (d.country === "GB" && !UK_POSTCODE.test(d.postcode)) {
      ctx.addIssue({
        code: "custom",
        path: ["postcode"],
        message: "Enter a valid UK postcode",
      });
    }
  });

export type CheckoutValues = z.infer<typeof checkoutSchema>;
