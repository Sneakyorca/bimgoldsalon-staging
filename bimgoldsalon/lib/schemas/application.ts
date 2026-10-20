import { z } from "zod";
import { requiredPhone } from "@/lib/schemas/auth";
import { applicationTypes } from "@/lib/schemas/training";

export const applicationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email address")
    .max(254),
  phone: requiredPhone,
  applicationType: z
    .string()
    .refine(
      (v) => (applicationTypes as readonly string[]).includes(v),
      "Choose an application type",
    ),
  agree: z
    .boolean()
    .refine((v) => v === true, {
      message: "Please accept the terms to continue",
    }),
});
export type ApplicationValues = z.infer<typeof applicationSchema>;
