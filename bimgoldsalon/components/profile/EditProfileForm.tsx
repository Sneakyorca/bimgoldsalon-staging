"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toE164 } from "@/lib/countries";
import { editProfileSchema, type EditProfileValues } from "@/lib/schemas/auth";
import {
  PasswordField,
  PhoneField,
  PrimaryButton,
  TextField,
  subtitleClass,
  titleClass,
} from "../auth/fields";

type User = { name: string; email: string; phone?: string };

const EditProfileForm = ({
  user,
  onSubmit,
}: {
  user: User;
  onSubmit?: (
    values: EditProfileValues,
  ) => Promise<string | void> | string | void;
}) => {
  const [notice, setNotice] = useState("");
  const [pwOpen, setPwOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: toE164(user.phone ?? ""),
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const submit = handleSubmit(
    async (values) => {
      setNotice("");
      try {
        const message = await onSubmit?.(values);
        setNotice(message || "Profile updated.");
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
      setNotice("");
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
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneField
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.phone?.message}
          />
        )}
      />

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
            label="New password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <p className="text-[13px] text-gray-500">
            Use 8+ characters with upper and lower case letters, a number and a
            symbol.
          </p>
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
      {notice && (
        <p role="status" className="text-[14px] text-green-700 md:text-center">
          {notice}
        </p>
      )}
      <PrimaryButton loading={isSubmitting}>Save changes</PrimaryButton>
    </form>
  );
};

export default EditProfileForm;
