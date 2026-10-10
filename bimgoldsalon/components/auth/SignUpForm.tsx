"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUpSchema, type SignUpValues } from "@/lib/schemas/auth";
import {
  OrDivider,
  PasswordField,
  PhoneField,
  PrimaryButton,
  SocialButtons,
  TextField,
  subtitleClass,
  titleClass,
  logSubmit,
  type SubmitHandler,
} from "./fields";

const SignUpForm = ({
  onSubmit,
}: {
  onSubmit?: SubmitHandler<SignUpValues>;
}) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      logSubmit("Sign up", values);
      await onSubmit?.(values);
    } catch (err) {
      setError("root.server", {
        message:
          err instanceof Error
            ? err.message
            : "Could not create your account. Try again.",
      });
    }
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="w-full space-y-4 md:mx-auto md:max-w-[487px] md:space-y-6"
    >
      <h1 className={`${titleClass} text-[#313c6b] md:text-black`}>
        <span className="md:hidden">Sign up</span>
        <span className="hidden md:inline">Create Account</span>
      </h1>
      <p className={subtitleClass}>Sign up with email &amp; password</p>
      {/* <SocialButtons mode="signup" /> */}
      {/* <OrDivider /> */}

      <TextField
        label="Full name"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PhoneField error={errors.phone?.message} {...register("phone")} />
      <PasswordField
        label="Password (8+ characters)"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        label="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {errors.root?.server && (
        <p role="alert" className="text-[14px] text-red-600">
          {errors.root.server.message}
        </p>
      )}
      <PrimaryButton loading={isSubmitting}>Sign up</PrimaryButton>
    </form>
  );
};

export default SignUpForm;
