"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signInSchema, signUpSchema } from "@/lib/schemas/auth";
import * as auth from "@/Data/auth";

export type ActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

// Only allow same-site paths, so ?next= can't send people to another website
function safeNext(next?: string | null) {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  )
    return "/account";
  return next;
}

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const newPasswordSchema = z.string().min(8).max(72);

export async function signInAction(
  values: unknown,
  next?: string,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success)
    return { ok: false, error: "Check your details and try again." };

  const res = await auth.signIn(parsed.data.identifier, parsed.data.password);
  if (!res.ok) return res;

  revalidatePath("/", "layout");
  return { ok: true, redirectTo: safeNext(next) };
}

export async function signUpAction(values: unknown): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success)
    return { ok: false, error: "Check your details and try again." };

  const { name, email, phone, password } = parsed.data;
  const res = await auth.signUp({ name, email, phone, password }, siteUrl());
  if (!res.ok) return res;

  revalidatePath("/", "layout");
  return {
    ok: true,
    redirectTo: res.needsConfirmation
      ? `/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`
      : "/account",
  };
}

export async function forgotPasswordAction(
  values: unknown,
): Promise<ActionResult> {
  const email = emailSchema.safeParse(
    (values as { email?: unknown } | null)?.email,
  );
  if (!email.success)
    return { ok: false, error: "Enter a valid email address." };

  await auth.sendPasswordReset(email.data, siteUrl());
  // Same response whether or not the account exists
  return {
    ok: true,
    redirectTo: `/check-email?email=${encodeURIComponent(email.data)}&type=recovery`,
  };
}

export async function resetPasswordAction(
  values: unknown,
): Promise<ActionResult> {
  const password = newPasswordSchema.safeParse(
    (values as { password?: unknown } | null)?.password,
  );
  if (!password.success)
    return { ok: false, error: "Password must be 8–72 characters." };

  const res = await auth.changePassword(password.data);
  if (!res.ok) return res;

  revalidatePath("/", "layout");
  return { ok: true, redirectTo: "/account" };
}

export async function signOutAction() {
  await auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth");
}
