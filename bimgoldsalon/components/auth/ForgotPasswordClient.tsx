"use client";

import { forgotPasswordAction } from "@/app/auth/actions";
import { isRedirectError } from "@/lib/redirect-error";
import type { ForgotPasswordValues } from "@/lib/schemas/auth";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordClient() {
  const submit = async (values: ForgotPasswordValues) => {
    try {
      const result = await forgotPasswordAction(values);
      if (result && !result.ok) throw new Error(result.error);
    } catch (e) {
      if (isRedirectError(e)) return;
      throw e;
    }
  };
  return <ForgotPasswordForm onSubmit={submit} />;
}
