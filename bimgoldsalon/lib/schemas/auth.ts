import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email")
  .email("Enter a valid email address");

// Phone numbers are saved with their country code, like +447123456789
export const E164 = /^\+[1-9]\d{6,14}$/;

// Optional: empty is fine
export const optionalPhone = z
  .string()
  .trim()
  .regex(E164, "Enter a valid phone number")
  .or(z.literal(""));

export const requiredPhone = z
  .string()
  .trim()
  .min(1, "Enter your phone number")
  .regex(E164, "Enter a valid phone number");

const phone = optionalPhone;
// Same rules as Supabase: Authentication -> Sign In / Providers -> Email
export const strongPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use 72 characters or fewer")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[0-9]/, "Add a number")
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/, "Add a symbol, e.g. ! @ # $");

export const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or phone number"),
  password: z.string().min(1, "Enter your password"),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email,
    phone,
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email });

export const editProfileSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email,
    phone,
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmNewPassword: z.string(),
  })
  .superRefine((d, ctx) => {
    // Password fields only matter once the person starts changing it
    if (!d.newPassword && !d.confirmNewPassword) return;
    if (!d.currentPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "Enter your current password",
      });
    }
    const strength = strongPassword.safeParse(d.newPassword);
    if (!strength.success) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message:
          strength.error.issues[0]?.message ?? "Choose a stronger password",
      });
    }
    if (d.newPassword !== d.confirmNewPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "Passwords don't match",
      });
    }
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type EditProfileValues = z.infer<typeof editProfileSchema>;
