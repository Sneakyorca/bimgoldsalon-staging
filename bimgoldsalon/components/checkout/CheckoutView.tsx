"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { placeOrderAction } from "@/app/checkout/actions";
import CountrySelect from "@/components/common/CountrySelect";
import PhoneInput from "@/components/common/PhoneInput";
import { useCart } from "@/context/CartContext";
import { deliveryFeeFor, deliveryOptions } from "@/lib/delivery-options";
import { SHIPPING_COUNTRY_CODES } from "@/lib/countries";
import {
  deliveryAvailability,
  type DeliveryAvailability,
} from "@/lib/delivery";
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

type Defaults = Partial<
  Pick<CheckoutValues, "firstName" | "lastName" | "email" | "phone">
>;

const CheckoutView = ({ defaults = {} }: { defaults?: Defaults }) => {
  const router = useRouter();
  const {
    ready,
    cartItems,
    subtotal,
    deliveryMethod,
    setDeliveryMethod,
    clearCart,
  } = useCart();

  const [avail, setAvail] = useState<DeliveryAvailability | null>(null);
  const [serverError, setServerError] = useState("");
  const [cartProblem, setCartProblem] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: defaults.firstName ?? "",
      lastName: defaults.lastName ?? "",
      country: SHIPPING_COUNTRY_CODES?.[0] ?? "GB",
      street: "",
      city: "",
      state: "",
      postcode: "",
      phone: defaults.phone ?? "",
      email: defaults.email ?? "",
      notes: "",
      agree: false,
    },
  });

  // Which delivery options can be picked right now (same-day has a 2pm cut-off)
  useEffect(() => {
    setAvail(deliveryAvailability());
  }, []);
  useEffect(() => {
    if (avail && !avail[deliveryMethod]?.available) {
      const next = deliveryOptions.find((o) => avail[o.id]?.available);
      if (next) setDeliveryMethod(next.id);
    }
  }, [avail, deliveryMethod, setDeliveryMethod]);

  const selected =
    deliveryOptions.find((o) => o.id === deliveryMethod) ?? deliveryOptions[0];
  const itemCount = cartItems.reduce((n, i) => n + i.qty, 0);
  const fee = deliveryFeeFor(selected, itemCount);
  const orderTotal = subtotal + fee;
  const feeText = fee === 0 ? "Free" : formatPrice(fee);

  const placeOrder = handleSubmit(async (values) => {
    setServerError("");
    setCartProblem(false);
    const res = await placeOrderAction(
      values,
      cartItems.map((i) => ({ id: i.id, qty: i.qty })),
      deliveryMethod,
    );
    if (!res.ok) {
      if (res.code === "login") {
        router.push("/auth?next=/checkout");
        return;
      }
      setCartProblem(res.code === "stock");
      setServerError(res.error);
      return;
    }
    if (res.paymentUrl) {
      // Stripe's secure payment page. The cart is cleared once payment succeeds.
      setRedirecting(true);
      window.location.assign(res.paymentUrl);
      return;
    }
    router.push(`/checkout/confirmed?id=${res.orderId}`);
    clearCart();
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
          <Field label="Country/Region" error={errors.country?.message}>
            <CountrySelect
              className={inputClass}
              only={SHIPPING_COUNTRY_CODES}
              aria-invalid={!!errors.country}
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
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="County"
              required={false}
              error={errors.state?.message}
            >
              <input
                className={inputClass}
                autoComplete="address-level1"
                aria-invalid={!!errors.state}
                {...register("state")}
              />
            </Field>
            <Field label="Postcode" error={errors.postcode?.message}>
              <input
                className={`${inputClass} uppercase`}
                autoComplete="postal-code"
                aria-invalid={!!errors.postcode}
                {...register("postcode")}
              />
            </Field>
          </div>
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
            <Row label="Estimated total" value={formatPrice(orderTotal)} big />

            <fieldset className="mt-6 space-y-5">
              <legend className="sr-only">Delivery method</legend>
              {deliveryOptions.map((opt) => {
                const a = avail?.[opt.id];
                const disabled = a ? !a.available : false;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={opt.id}
                      checked={deliveryMethod === opt.id}
                      disabled={disabled}
                      onChange={() => setDeliveryMethod(opt.id)}
                      className="mt-1.5 size-4 accent-primary"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-3 text-[16px] font-semibold">
                        <span>{opt.label}</span>
                        <span className="shrink-0">
                          {opt.fee === 0
                            ? "Free"
                            : `${formatPrice(opt.fee)}${opt.perItem ? " per item" : ""}`}
                        </span>
                      </span>
                      <span className="mt-1 block text-[14px] leading-snug text-gray-700">
                        {opt.note}
                      </span>
                      {disabled && a?.reason && (
                        <span className="mt-1 block text-[13px] font-medium text-red-700">
                          {a.reason}
                        </span>
                      )}
                      {opt.address && deliveryMethod === opt.id && (
                        <span className="mt-2 block text-[14px] leading-snug">
                          <b>Address:</b> {opt.address}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </fieldset>

            <div className="mt-6 flex items-center justify-between border-t border-black/30 pt-5 text-[20px] font-semibold">
              <span>Estimated total</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-3xl bg-[#eeeeee] p-5 md:p-8">
            <h2 className="text-[28px] font-semibold md:text-[40px]">
              Payment
            </h2>
            <p className="mt-3 text-[16px] md:text-[18px]">
              You&apos;ll pay securely on Stripe&apos;s payment page. We never
              see your card details.
            </p>
            <p className="mt-5 text-[14px] leading-snug">
              Your personal data will be used to process your order, support
              your experience throughout this website, and for other purposes
              described in our{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                privacy policy
              </Link>
              .
            </p>
            <label className="mt-5 flex items-start gap-3 text-[14px]">
              <input
                type="checkbox"
                aria-invalid={!!errors.agree}
                className="mt-0.5 size-5 shrink-0 accent-primary"
                {...register("agree")}
              />
              <span>
                I have read and agree to the website{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  terms and conditions
                </Link>
                .
              </span>
            </label>
            {errors.agree && (
              <p role="alert" className="mt-1 text-[13px] text-red-600">
                {errors.agree.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || redirecting}
              className="mx-auto mt-6 block h-12 w-full max-w-90 rounded-full bg-primary text-[18px] font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting || redirecting
                ? "Taking you to payment..."
                : "Place order & pay"}
            </button>
            {serverError && (
              <p
                role="alert"
                className="mt-4 text-center text-[14px] text-red-600"
              >
                {serverError}{" "}
                {cartProblem && (
                  <Link href="/cart" className="font-semibold underline">
                    Go to cart
                  </Link>
                )}
              </p>
            )}
          </div>
        </div>
      </form>
    </section>
  );
};

export default CheckoutView;
