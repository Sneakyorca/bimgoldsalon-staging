"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/schemas/auth";
import {
  PrimaryButton,
  TextField,
  titleClass,
  logSubmit,
  type SubmitHandler,
} from "./fields";

const bodyClass =
  "text-[16px] text-gray-600 md:text-center md:text-[18px] md:text-black";

const ForgotPasswordForm = ({
  onSubmit,
}: {
  onSubmit?: SubmitHandler<ForgotPasswordValues>;
}) => {
  const [sentTo, setSentTo] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const submit = handleSubmit(async (values) => {
    try {
      logSubmit("Forgot password", values);
      await onSubmit?.(values);
      setSentTo(values.email);
    } catch (err) {
      setError("root.server", {
        message:
          err instanceof Error
            ? err.message
            : "Could not send the reset link. Try again.",
      });
    }
  });

  if (sentTo) {
    return (
      <div role="status" className="space-y-4 md:space-y-6">
        <h1 className={`${titleClass} text-[#313c6b] md:text-black`}>
          Check your email
        </h1>
        <p className={bodyClass}>
          If an account exists for{" "}
          <span className="font-semibold text-black">{sentTo}</span>, we have
          sent a link to reset your password.
        </p>
        <button
          type="button"
          onClick={() => setSentTo("")}
          className="block text-[14px] font-bold md:mx-auto"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 md:space-y-6">
      <h1 className={`${titleClass} text-[#313c6b] md:text-black`}>
        Forgot password
      </h1>
      <p className={bodyClass}>
        Enter the email linked to your account and we will send you a link to
        reset your password.
      </p>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      {errors.root?.server && (
        <p role="alert" className="text-[14px] text-red-600">
          {errors.root.server.message}
        </p>
      )}
      <PrimaryButton loading={isSubmitting}>Send reset link</PrimaryButton>
    </form>
  );
};

export default ForgotPasswordForm;
