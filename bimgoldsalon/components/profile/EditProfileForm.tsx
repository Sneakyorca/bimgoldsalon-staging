"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { editProfileSchema, type EditProfileValues } from "@/lib/schemas/auth";
import {
  PasswordField,
  PhoneField,
  PrimaryButton,
  TextField,
  subtitleClass,
  titleClass,
  logSubmit,
  type SubmitHandler,
} from "../auth/fields";

type User = { name: string; email: string; phone?: string };

const EditProfileForm = ({
  user,
  onSubmit,
}: {
  user: User;
  onSubmit?: SubmitHandler<EditProfileValues>;
}) => {
  const [saved, setSaved] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const submit = handleSubmit(
    async (values) => {
      setSaved(false);
      try {
        logSubmit("Edit profile", values);
        await onSubmit?.(values);
        setSaved(true);
        resetField("currentPassword");
        resetField("newPassword");
        resetField("confirmNewPassword");
      } catch (err) {
        setError("root.server", {
          message:
            err instanceof Error
              ? err.message
              : "Could not save changes. Try again.",
        });
      }
    },
    // errors inside a closed <details> would be invisible, so open it
    (errs) => {
      setSaved(false);
      if (errs.currentPassword || errs.newPassword || errs.confirmNewPassword)
        setPwOpen(true);
    },
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-4 md:space-y-6">
      <h1 className={`${titleClass} text-[#313c6b] md:text-black`}>
        Edit profile
      </h1>
      <p className={subtitleClass}>Update your name, email or phone number</p>

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

      <details
        open={pwOpen}
        onToggle={(e) => setPwOpen(e.currentTarget.open)}
        className="rounded-lg border border-black/20 px-3 py-3 md:px-5"
      >
        <summary className="cursor-pointer text-[16px] font-semibold">
          Change password
        </summary>
        <div className="mt-4 space-y-4 md:space-y-6">
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <PasswordField
            label="New password (8+ characters)"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword")}
          />
        </div>
      </details>

      {errors.root?.server && (
        <p role="alert" className="text-[14px] text-red-600 md:text-center">
          {errors.root.server.message}
        </p>
      )}
      {saved && (
        <p role="status" className="text-[14px] text-green-700 md:text-center">
          Profile updated.
        </p>
      )}
      <PrimaryButton loading={isSubmitting}>Save changes</PrimaryButton>
    </form>
  );
};

export default EditProfileForm;
