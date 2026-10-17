"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  type SignInValues,
  type SignUpValues,
  type ForgotPasswordValues,
} from "@/lib/schemas/auth";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/schemas/reset-password";
import * as auth from "@/Data/auth";
import { safeNext } from "@/lib/auth/redirect";

type Fail = { ok: false; error: string };
const fail = (error: string): Fail => ({ ok: false, error });

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

export async function signInAction(
  values: SignInValues,
  next?: string,
): Promise<Fail | void> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return fail("Check your details and try again.");

  const result = await auth.signIn(
    parsed.data.identifier,
    parsed.data.password,
  );
  if (!result.ok) return fail(result.error);

  revalidatePath("/", "layout");
  redirect(safeNext(next, result.role === "admin" ? "/admin" : "/account"));
}

export async function signUpAction(values: SignUpValues): Promise<Fail | void> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return fail("Check your details and try again.");

  const { name, email, phone, password } = parsed.data;
  const result = await auth.signUp({ name, email, phone, password }, siteUrl());
  if (!result.ok) return fail(result.error);

  revalidatePath("/", "layout");
  if (!result.needsConfirmation) redirect("/account");
  redirect(`/auth/check-email?type=signup&email=${encodeURIComponent(email)}`);
}

export async function forgotPasswordAction(
  values: ForgotPasswordValues,
): Promise<Fail | void> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return fail("Enter a valid email address.");

  await auth.sendPasswordReset(parsed.data.email, siteUrl());
  // Same response whether or not the account exists
  redirect(
    `/auth/check-email?type=reset&email=${encodeURIComponent(parsed.data.email)}`,
  );
}

export async function resetPasswordAction(
  values: ResetPasswordValues,
): Promise<Fail | void> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return fail("Check your passwords and try again.");

  const result = await auth.changePassword(parsed.data.password);
  if (!result.ok) return fail(result.error);

  revalidatePath("/", "layout");
  redirect("/auth?reset=1");
}

export async function signOutAction() {
  await auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth");
}
