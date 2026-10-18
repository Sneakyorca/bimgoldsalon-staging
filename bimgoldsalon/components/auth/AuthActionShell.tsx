"use client";

import AuthShell from "./AuthShell";
import { isRedirectError } from "@/lib/redirect-error";
import type { SignInValues, SignUpValues } from "@/lib/schemas/auth";
import type { SubmitHandler } from "./fields";

type Result = { ok: false; error: string } | void;

type Props = {
  next?: string;
  signInAction: (values: SignInValues, next?: string) => Promise<Result>;
  signUpAction: (values: SignUpValues) => Promise<Result>;
};

// A successful sign-in redirects, which the browser reports as a thrown
// NEXT_REDIRECT. Ignore that one and show every real error.
async function run(task: () => Promise<Result>) {
  try {
    const result = await task();
    if (result && !result.ok) throw new Error(result.error);
  } catch (e) {
    if (isRedirectError(e)) return;
    throw e;
  }
}

export default function AuthActionShell({
  next,
  signInAction,
  signUpAction,
}: Props) {
  const onSignIn: SubmitHandler<SignInValues> = (values) =>
    run(() => signInAction(values, next));
  const onSignUp: SubmitHandler<SignUpValues> = (values) =>
    run(() => signUpAction(values));
  return <AuthShell onSignIn={onSignIn} onSignUp={onSignUp} />;
}
