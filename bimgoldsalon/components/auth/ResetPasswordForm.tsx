"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/schemas/reset-password";
import {
  PasswordField,
  PrimaryButton,
  titleClass,
  type SubmitHandler,
} from "./fields";

export default function ResetPasswordForm({
  onSubmit,
}: {
  onSubmit?: SubmitHandler<ResetPasswordValues>;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit?.(values);
    } catch (error) {
      setError("root.server", {
        message:
          error instanceof Error
            ? error.message
            : "Could not reset your password.",
      });
    }
  });
  return (
    <form onSubmit={submit} noValidate className="space-y-4 md:space-y-6">
      <h1 className={`${titleClass} text-[#313c6b] md:text-black`}>
        Set a new password
      </h1>
      <p className="text-[16px] text-gray-600 md:text-center md:text-[18px]">
        Choose a new password for your account.
      </p>
      <PasswordField
        label="New password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {errors.root?.server && (
        <p role="alert" className="text-[14px] text-red-600">
          {errors.root.server.message}
        </p>
      )}
      <PrimaryButton loading={isSubmitting}>Save password</PrimaryButton>
    </form>
  );
}
