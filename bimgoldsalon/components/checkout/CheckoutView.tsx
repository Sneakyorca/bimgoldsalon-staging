"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "@/context/CartContext";
import { deliveryOptions } from "@/dummydata/deliveryData";
import { formatPrice } from "@/lib/format";
import { checkoutSchema, type CheckoutValues } from "@/lib/schemas/checkout";
import CheckoutSteps from "../site/CheckoutSteps";

const inputClass =
  "h-10 w-full rounded-lg border border-black bg-white px-3 text-[15px] outline-none focus:ring-2 focus:ring-primary/30 aria-invalid:border-red-600 aria-invalid:ring-2 aria-invalid:ring-red-500/30 md:h-11";

const Field = ({
  label,
  required = true,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-[14px] md:text-[16px]">
      {label}
      {required && <span className="text-red-600"> *</span>}
    </span>
    {children}
    {error && (
      <span role="alert" className="mt-1 block text-[13px] text-red-600">
        {error}
      </span>
    )}
  </label>
);

const Row = ({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) => (
  <div
    className={`flex items-center justify-between gap-4 border-b border-black/20 py-3.5 ${big ? "text-[18px] font-semibold md:text-[20px]" : "text-[16px]"}`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const CheckoutView = () => {
  const {
    ready,
    cartItems,
    subtotal,
    deliveryFee,
    total,
    deliveryMethod,
    setDeliveryMethod,
  } = useCart();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "Nigeria",
      street: "",
      city: "",
      state: "",
      phone: "",
      email: "",
      notes: "",
      agree: false,
    },
  });

  const selected =
    deliveryOptions.find((o) => o.id === deliveryMethod) ?? deliveryOptions[0];
  const feeText = deliveryFee === 0 ? "Free" : formatPrice(deliveryFee);

  const placeOrder = handleSubmit(async (values) => {
    // TODO: create a Stripe Checkout Session (server action / API route) from these
    // items + deliveryMethod, then redirect the browser to session.url
    console.log("[Checkout]", {
      ...values,
      deliveryMethod,
      items: cartItems.map(({ id, name, qty, price }) => ({
        id,
        name,
        qty,
        price,
      })),
      total,
    });
  });

  if (!ready) return <div className="min-h-[50vh]" aria-busy="true" />;

  if (cartItems.length === 0)
    return (
      <section className="mx-auto max-w-360 px-5 py-20 text-center lg:px-12">
        <p className="text-[18px]">Your cart is empty.</p>
        <Link
          href="/product"
          className="mt-6 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white"
        >
          Continue shopping
        </Link>
      </section>
    );

  return (
    <section className="mx-auto w-full max-w-360 px-5 pb-16 pt-6 lg:px-12">
      <CheckoutSteps current={2} />

      <form
        onSubmit={placeOrder}
        noValidate
        className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10"
      >
        {/* Billing */}
        <div className="space-y-4">
          <h1 className="text-center text-[28px] font-semibold md:text-[40px] lg:text-left">
            Billing details
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" error={errors.firstName?.message}>
              <input
                className={inputClass}
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                {...register("firstName")}
              />
            </Field>
            <Field label="Last Name" error={errors.lastName?.message}>
              <input
                className={inputClass}
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                {...register("lastName")}
              />
            </Field>
          </div>
          <Field label="Country/Region">
            <input
              readOnly
              className={`${inputClass} bg-gray-50 font-semibold text-gray-600`}
              {...register("country")}
            />
          </Field>
          <Field label="Street address" error={errors.street?.message}>
            <input
              className={inputClass}
              autoComplete="street-address"
              aria-invalid={!!errors.street}
              {...register("street")}
            />
          </Field>
          <Field label="Town/City" error={errors.city?.message}>
            <input
              className={inputClass}
              autoComplete="address-level2"
              aria-invalid={!!errors.city}
              {...register("city")}
            />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <input
              className={inputClass}
              autoComplete="address-level1"
              aria-invalid={!!errors.state}
              {...register("state")}
            />
          </Field>
          <Field label="Phone Number" error={errors.phone?.message}>
            <input
              type="tel"
              inputMode="tel"
              placeholder="(555) 000-0000"
              className={inputClass}
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
          </Field>
          <Field label="Email Address" error={errors.email?.message}>
            <input
              type="email"
              placeholder="name@example.com"
              className={inputClass}
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </Field>
          <Field
            label="Order notes (optional)"
            required={false}
            error={errors.notes?.message}
          >
            <textarea
              rows={4}
              className={`${inputClass} h-auto py-2`}
              {...register("notes")}
            />
          </Field>
        </div>

        <div className="space-y-6">
          {/* Order summary */}
          <div className="rounded-3xl bg-[#eeeeee] p-5 md:p-8">
            <h2 className="text-[28px] font-semibold md:text-[40px]">
              Your Order
            </h2>
            <p className="mt-5 border-b border-black/30 pb-2 text-[18px]">
              Cart total
            </p>

            <Row label="Subtotal" value={formatPrice(subtotal)} />
            <Row label={selected.label} value={feeText} />
            <Row label="Estimated total" value={formatPrice(total)} big />

            <fieldset className="mt-6 space-y-5">
              <legend className="sr-only">Delivery method</legend>
              {deliveryOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={opt.id}
                    checked={deliveryMethod === opt.id}
                    onChange={() => setDeliveryMethod(opt.id)}
                    className="mt-1.5 size-4 accent-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between gap-3 text-[16px] font-semibold">
                      <span>{opt.label}</span>
                      <span className="shrink-0">
                        {opt.fee === 0 ? "Free" : formatPrice(opt.fee)}
                      </span>
                    </span>
                    <span className="mt-1 block text-[14px] leading-snug text-gray-700">
                      {opt.note}
                    </span>
                    {opt.address && deliveryMethod === opt.id && (
                      <span className="mt-2 block text-[14px] leading-snug">
                        <b>Address:</b> {opt.address}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="mt-6 flex items-center justify-between border-t border-black/30 pt-5 text-[20px] font-semibold">
              <span>Estimated total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Payment: handled on Stripe's hosted page */}
          <div className="rounded-3xl bg-[#eeeeee] p-5 md:p-8">
            <h2 className="text-[28px] font-semibold md:text-[40px]">
              Payment
            </h2>
            <p className="mt-3 text-[16px] md:text-[18px]">
              You will be taken to Stripe to pay securely.
            </p>
            <p className="mt-5 text-[14px] leading-snug">
              Your personal data will be used to process your order, support
              your experience throughout this website, and for other purposes
              described in our privacy policy.
            </p>
            <label className="mt-5 flex items-start gap-3 text-[14px]">
              <input
                type="checkbox"
                aria-invalid={!!errors.agree}
                className="mt-0.5 size-5 shrink-0 accent-primary"
                {...register("agree")}
              />
              I have read and agree to the website terms and conditions.
            </label>
            {errors.agree && (
              <p role="alert" className="mt-1 text-[13px] text-red-600">
                {errors.agree.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mx-auto mt-6 block h-12 w-full max-w-90 rounded-full bg-primary text-[18px] font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Please wait..." : "Place Order"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default CheckoutView;
