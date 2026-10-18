"use client";

import { resetPasswordAction } from "@/app/auth/actions";
import { isRedirectError } from "@/lib/redirect-error";
import type { ResetPasswordValues } from "@/lib/schemas/reset-password";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordClient() {
  const submit = async (values: ResetPasswordValues) => {
    try {
      const result = await resetPasswordAction(values);
      if (result && !result.ok) throw new Error(result.error);
    } catch (e) {
      if (isRedirectError(e)) return;
      throw e;
    }
  };
  return <ResetPasswordForm onSubmit={submit} />;
}
