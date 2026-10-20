import { z } from "zod";

const minute = z.number().int().min(0).max(1440);
const day = z
  .object({ open: minute, close: minute })
  .nullable()
  .refine(
    (d) => d === null || d.close > d.open,
    "Closing time must be after opening time.",
  );

export const settingsSchema = z.object({
  /** Index 0 = Sunday … 6 = Saturday. null means closed. */
  openingHours: z.array(day).length(7),
  capacity: z.number().int().min(1, "At least 1 client at a time.").max(20),
  cancellationHours: z
    .number()
    .int()
    .min(0)
    .max(168, "Up to 168 hours (7 days)."),
  slotStep: z.union([z.literal(15), z.literal(30), z.literal(60)]),
  minLeadMin: z.number().int().min(0).max(2880),
  windowDays: z
    .number()
    .int()
    .min(7, "At least 7 days.")
    .max(90, "At most 90 days."),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
