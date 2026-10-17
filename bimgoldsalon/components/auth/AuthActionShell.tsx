"use client";

import AuthShell from "./AuthShell";
import type { SignInValues, SignUpValues } from "@/lib/schemas/auth";
import type { SubmitHandler } from "./fields";

type Props = {
  next?: string;
  signInAction: (
    values: SignInValues,
    next?: string,
  ) => Promise<{ ok: false; error: string } | void>;
  signUpAction: (
    values: SignUpValues,
  ) => Promise<{ ok: false; error: string } | void>;
};

export default function AuthActionShell({
  next,
  signInAction,
  signUpAction,
}: Props) {
  const onSignIn: SubmitHandler<SignInValues> = async (values) => {
    const result = await signInAction(values, next);
    if (result && !result.ok) throw new Error(result.error);
  };
  const onSignUp: SubmitHandler<SignUpValues> = async (values) => {
    const result = await signUpAction(values);
    if (result && !result.ok) throw new Error(result.error);
  };
  return <AuthShell onSignIn={onSignIn} onSignUp={onSignUp} />;
}
