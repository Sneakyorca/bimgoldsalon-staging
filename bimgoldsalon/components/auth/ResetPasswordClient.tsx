"use client";

import { resetPasswordAction } from "@/app/auth/actions";
import type { ResetPasswordValues } from "@/lib/schemas/reset-password";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordClient() {
  const submit = async (values: ResetPasswordValues) => {
    const result = await resetPasswordAction(values);
    if (result && !result.ok) throw new Error(result.error);
  };
  return <ResetPasswordForm onSubmit={submit} />;
}
