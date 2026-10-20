"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { submitApplicationAction } from "@/app/training/actions";
import PhoneInput from "@/components/common/PhoneInput";
import {
  applicationSchema,
  type ApplicationValues,
} from "@/lib/schemas/application";
import { applicationTypes } from "@/lib/schemas/training";

const inputClass =
  "h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-[16px] outline-none placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-red-600 aria-invalid:ring-2 aria-invalid:ring-red-500/20";

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="mb-2 block text-[14px] font-medium">{label}</span>
    {children}
    {error && (
      <span role="alert" className="mt-1 block text-[13px] text-red-600">
        {error}
      </span>
    )}
  </label>
);

const ApplyForm = () => {
  const [sent, setSent] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      applicationType: "",
      agree: false,
    },
  });

  const submit = handleSubmit(async (values) => {
    setSent(false);
    try {
      const res = await submitApplicationAction(values);
      if (!res.ok) {
        setError("root.server", { message: res.error });
        return;
      }
      reset();
      setSent(true);
    } catch {
      setError("root.server", {
        message: "Something went wrong. Please try again.",
      });
    }
  });

  return (
    <section className="mx-auto w-full max-w-360 px-5 py-8 lg:px-12 lg:py-12">
      <div className="fade-up mx-auto w-full max-w-140 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] md:p-8">
        <h1 className="text-[32px] font-semibold leading-tight text-[#0f1a3d]">
          Apply Now
        </h1>
        <p className="mt-2 text-[16px] text-gray-700">
          Take the next step in your professional journey with BIM-GOLD Hair
          &amp; Beauty Salon.
        </p>

        <form onSubmit={submit} noValidate className="mt-8 space-y-6">
          <Field label="Full Name" error={errors.fullName?.message}>
            <input
              placeholder="Enter your full name"
              autoComplete="name"
              aria-invalid={!!errors.fullName}
              className={inputClass}
              {...register("fullName")}
            />
          </Field>

          <Field label="Email Address" error={errors.email?.message}>
            <input
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className={inputClass}
              {...register("email")}
            />
          </Field>

          <Field label="Phone Number" error={errors.phone?.message}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputClassName={inputClass}
                  invalid={!!errors.phone}
                />
              )}
            />
          </Field>

          <Field
            label="Application Type"
            error={errors.applicationType?.message}
          >
            <div className="relative">
              <select
                aria-invalid={!!errors.applicationType}
                className={`${inputClass} appearance-none pr-10`}
                {...register("applicationType")}
              >
                <option value="">Select an option</option>
                {applicationTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2" />
            </div>
          </Field>

          <div>
            <label className="flex items-start gap-3 text-[14px] text-gray-700">
              <input
                type="checkbox"
                aria-invalid={!!errors.agree}
                className="mt-0.5 size-5 shrink-0 rounded accent-primary"
                {...register("agree")}
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  Privacy Policy
                </Link>{" "}
                regarding my application data.
              </span>
            </label>
            {errors.agree && (
              <p role="alert" className="mt-1 text-[13px] text-red-600">
                {errors.agree.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-semibold text-white shadow-md transition enabled:hover:opacity-90 enabled:hover:shadow-lg disabled:opacity-60"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Application <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        <hr className="mt-6 border-gray-200" />
        <div aria-live="polite" className="min-h-8 pt-4 text-[14px]">
          {sent && (
            <p className="fade-up font-medium text-green-700">
              Thank you! Your application has been received and we will be in
              touch soon.
            </p>
          )}
          {errors.root?.server && (
            <p className="text-red-600">{errors.root.server.message}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ApplyForm;
