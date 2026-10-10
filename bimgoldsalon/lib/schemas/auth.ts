import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email")
  .email("Enter a valid email address");

// Optional: empty is fine, otherwise digits/spaces/dashes with an optional leading +
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number")
  .or(z.literal(""));

const newPassword = z.string().min(8, "Use at least 8 characters");

export const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or phone number"),
  password: z.string().min(1, "Enter your password"),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email,
    phone,
    password: newPassword,
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
    if (d.newPassword.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "Use at least 8 characters",
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
