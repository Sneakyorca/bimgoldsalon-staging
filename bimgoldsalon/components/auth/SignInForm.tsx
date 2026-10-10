"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInSchema, type SignInValues } from "@/lib/schemas/auth";
import {
  PasswordField,
  PrimaryButton,
  TextField,
  logSubmit,
  subtitleClass,
  titleClass,
  type SubmitHandler,
} from "./fields";

const SignInForm = ({
  onSubmit,
}: {
  onSubmit?: SubmitHandler<SignInValues>;
}) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const submit = handleSubmit(async (values) => {
    try {
      logSubmit("Sign in", values);
      await onSubmit?.(values);
    } catch (err) {
      setError("root.server", {
        message:
          err instanceof Error
            ? err.message
            : "Could not sign in. Check your details and try again.",
      });
    }
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="w-full space-y-4 md:mx-auto md:max-w-[487px] md:space-y-6"
    >
      <h1 className={`${titleClass} text-black md:capitalize`}>Sign in</h1>
      <p className={subtitleClass}>Sign in with email &amp; password</p>

      <TextField
        label="Email or phone number"
        autoComplete="username"
        error={errors.identifier?.message}
        {...register("identifier")}
      />
      <PasswordField
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Link
        href="/forgot-password"
        className="block text-[16px] font-bold md:text-center md:font-normal md:text-[#555]"
      >
        Forgot Password?
      </Link>

      {errors.root?.server && (
        <p role="alert" className="text-[14px] text-red-600">
          {errors.root.server.message}
        </p>
      )}
      <PrimaryButton loading={isSubmitting}>Sign in</PrimaryButton>
    </form>
  );
};

export default SignInForm;
