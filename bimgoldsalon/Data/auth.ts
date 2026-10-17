import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "./profile";
import { toE164 } from "@/lib/countries";

const INVALID = "Incorrect email, phone or password.";

export type SignInResult =
  | { ok: true; role: "customer" | "admin" }
  | { ok: false; error: string };
export type SignUpResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false; error: string };

export async function signIn(
  identifier: string,
  password: string,
): Promise<SignInResult> {
  const value = identifier.trim();
  let email = value.toLowerCase();

  // Phone login: look the email up with the admin client (never exposed to the browser)
  if (!value.includes("@")) {
    const { data } = await createAdminClient()
      .from("profiles")
      .select("email")
      .eq("phone", toE164(value))
      .maybeSingle();
    if (!data?.email) return { ok: false, error: INVALID };
    email = data.email;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return {
        ok: false,
        error: "Confirm your email first. Check your inbox for the link.",
      };
    }
    return { ok: false, error: INVALID };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  return { ok: true, role: profile?.role === "admin" ? "admin" : "customer" };
}

export async function signUp(
  input: { name: string; email: string; phone: string; password: string },
  siteUrl: string,
): Promise<SignUpResult> {
  const phone = normalizePhone(input.phone);
  const email = input.email.trim().toLowerCase();

  if (phone) {
    const { data: taken } = await createAdminClient()
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (taken) {
      return { ok: false, error: "That phone number is already registered." };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { full_name: input.name.trim(), phone },
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/auth/confirmed`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (error.code === "weak_password") {
      return {
        ok: false,
        error:
          "Password must include uppercase and lowercase letters, a number and a symbol.",
      };
    }
    if (error.code === "over_email_send_rate_limit") {
      return { ok: false, error: "Too many attempts. Please try again later." };
    }
    console.error("[signUp]", error.code, error.message);
    return { ok: false, error: "Could not create your account. Try again." };
  }

  // Confirmation off -> a session comes back straight away
  return { ok: true, needsConfirmation: !data.session };
}

// Never reveals whether the email exists.
export async function sendPasswordReset(email: string, siteUrl: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${siteUrl}/auth/confirm?next=/auth/reset-password` },
  );
  if (error) console.error("[sendPasswordReset]", error.code, error.message);
}

export async function changePassword(
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return {
      ok: false,
      error: "This reset link has expired. Request a new one.",
    };
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("[changePassword]", error.code, error.message);
    if (error.code === "same_password")
      return { ok: false, error: "Choose a password you haven't used before." };
    if (error.code === "weak_password")
      return {
        ok: false,
        error:
          "Password must include uppercase and lowercase letters, a number and a symbol.",
      };
    return { ok: false, error: "Could not update your password. Try again." };
  }
  // Sign out everywhere, then the user signs in with the new password
  await supabase.auth.signOut({ scope: "global" });
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
export async function changeEmail(
  email: string,
  siteUrl: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser(
    { email: email.trim().toLowerCase() },
    { emailRedirectTo: `${siteUrl}/auth/confirm?next=/auth/confirmed` },
  );
  if (error) {
    console.error("[changeEmail]", error.code, error.message);
    if (error.code === "email_exists")
      return { ok: false, error: "That email is already in use." };
    if (error.code === "over_email_send_rate_limit")
      return { ok: false, error: "Too many attempts. Please try again later." };
    return { ok: false, error: "Could not change your email. Try again." };
  }
  return { ok: true };
}

// For a normal signed-in session (the reset-link flow uses changePassword above)
export async function changePasswordWithCurrent(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return { ok: false, error: "Please sign in again." };

  // Re-check the current password ourselves
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: data.user.email,
    password: currentPassword,
  });
  if (verifyError)
    return { ok: false, error: "Your current password is incorrect." };

  // current_password is what Supabase's "require current password" setting looks for
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  } as Parameters<typeof supabase.auth.updateUser>[0]);

  if (error) {
    console.error("[changePasswordWithCurrent]", error.code, error.message);
    if (error.code === "same_password")
      return { ok: false, error: "Choose a password you haven't used before." };
    if (error.code === "weak_password")
      return {
        ok: false,
        error:
          "Password must include uppercase and lowercase letters, a number and a symbol.",
      };
    return { ok: false, error: "Could not update your password. Try again." };
  }
  await supabase.auth.signOut({ scope: "others" });
  return { ok: true };
}
