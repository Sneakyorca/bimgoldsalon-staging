import { z } from "zod";

export const applicationTypes = [
  "Training course",
  "Apprenticeship",
  "Job vacancy",
  "Work experience",
] as const;

export const trainingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email address"),
  // the +44 prefix is a fixed box next to the input, so this is just the rest of the number
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number")
    .regex(/^[0-9\s-]{7,15}$/, "Enter a valid phone number"),
  applicationType: z.string().min(1, "Select an application type"),
  agree: z
    .boolean()
    .refine((v) => v === true, {
      message: "Please accept the terms to continue",
    }),
});

export type TrainingValues = z.infer<typeof trainingSchema>;
