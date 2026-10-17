"use client";

import ForgotPasswordForm from "./ForgotPasswordForm";
import { forgotPasswordAction } from "@/app/auth/actions";
import type { ForgotPasswordValues } from "@/lib/schemas/auth";

export default function ForgotPasswordClient() {
  const submit = async (values: ForgotPasswordValues) => {
    const result = await forgotPasswordAction(values);
    if (result && !result.ok) throw new Error(result.error);
  };
  return <ForgotPasswordForm onSubmit={submit} />;
}
