import { z } from "zod";

const required = (msg: string) => z.string().trim().min(1, msg);

export const checkoutSchema = z.object({
  firstName: required("Enter your first name"),
  lastName: required("Enter your last name"),
  country: z.string(),
  street: required("Enter your street address"),
  city: required("Enter your town or city"),
  state: required("Enter your state"),
  phone: required("Enter your phone number").regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
  email: required("Enter your email").email("Enter a valid email address"),
  notes: z.string().max(500, "Keep notes under 500 characters"),
  agree: z.boolean().refine((v) => v === true, { message: "Please accept the terms to continue" }),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
