import { CheckCircle2, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type Stripe from "stripe";
import ClearAfterPayment from "@/components/payment/ClearAfterPayment";
import { getBookingForUser } from "@/Data/bookings";
import { getOrderForUser } from "@/Data/orders";
import { fulfilCheckoutSession } from "@/Data/payments";
import { requireUser } from "@/lib/auth/dal";
import {
  formatDuration,
  formatLongDate,
  formatRange,
  parseHHMM,
} from "@/lib/booking";
import { deliveryOptions } from "@/lib/delivery-options";
import { formatPrice } from "@/lib/format";
import { stripe } from "@/lib/stripe";
import CheckoutSteps from "@/components/site/CheckoutSteps";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };
const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Frame = ({
  paid,
  title,
  children,
}: {
  paid: boolean;
  title: string;
  children: ReactNode;
}) => (
  <section className="flex items-center justify-center bg-white px-4 py-16">
    <div className="w-full max-w-xl text-center">
      <div
        className={`mx-auto flex size-20 items-center justify-center rounded-full ${paid ? "bg-green-100" : "bg-amber-100"}`}
      >
        {paid ? (
          <CheckCircle2 className="size-10 text-green-600" />
        ) : (
          <Clock className="size-10 text-amber-600" />
        )}
      </div>
      <h1 className="mt-8 text-4xl font-semibold text-black">{title}</h1>
      {children}
    </div>
  </section>
);

const linkPrimary =
  "rounded-full bg-black px-8 py-3 text-white transition hover:opacity-90";
const linkGhost =
  "rounded-full border border-black px-8 py-3 text-black transition hover:bg-black hover:text-white";

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const user = await requireUser("/account");
  if (!session_id || !SESSION_ID.test(session_id)) notFound();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe().checkout.sessions.retrieve(session_id);
  } catch {
    notFound();
  }

  const paid = session.payment_status === "paid";
  // Records the payment now, so this page is right even if the webhook is slow.
  // Safe to repeat: the webhook does the same thing.
  if (paid) await fulfilCheckoutSession(session);

  const meta = session.metadata ?? {};

  if (meta.type === "order") {
    if (!meta.order_id || !/^\d{1,12}$/.test(meta.order_id)) notFound();
    const order = await getOrderForUser(user.id, meta.order_id);
    if (!order) notFound();
    const option = deliveryOptions.find((o) => o.id === order.deliveryMethod);

    return (
      <>
        <div className="mx-auto w-full max-w-360 px-5 pt-6 lg:px-12">
          <CheckoutSteps current={3} />
        </div>
        <Frame
          paid={paid}
          title={paid ? "Payment received!" : "Waiting for your payment"}
        >
          {paid && <ClearAfterPayment kind="order" />}
          <p className="mt-2 text-gray-600">Order #{order.id}</p>
          <p className="mt-4 leading-7 text-gray-600">
            {paid
              ? "Thank you! We'll start preparing your order and keep you updated."
              : "We haven't received your payment yet. If you've just paid, refresh this page in a moment."}
          </p>
          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 text-left">
            <ul className="space-y-1 text-gray-700">
              {order.items.map((item, i) => (
                <li
                  key={`${item.productId}-${i}`}
                  className="flex justify-between gap-4"
                >
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span className="shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 text-gray-700">
              <p className="flex justify-between">
                <span>{option?.label ?? "Delivery"}</span>
                <span>
                  {(order.deliveryFee ?? 0) === 0
                    ? "Free"
                    : formatPrice(order.deliveryFee ?? 0)}
                </span>
              </p>
              <p className="flex justify-between text-lg font-semibold text-black">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </p>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/product" className={linkPrimary}>
              Continue Shopping
            </Link>
            <Link href="/account" className={linkGhost}>
              View My Orders
            </Link>
          </div>
        </Frame>
      </>
    );
  }

  if (meta.type === "booking") {
    if (!meta.booking_id || !UUID.test(meta.booking_id)) notFound();
    const booking = await getBookingForUser(user.id, meta.booking_id);
    if (!booking) notFound();
    const start = parseHHMM(booking.time);

    return (
      <Frame
        paid={paid}
        title={paid ? "Booking confirmed!" : "Waiting for your deposit"}
      >
        {paid && <ClearAfterPayment kind="booking" />}
        <p className="mt-4 leading-7 text-gray-600">
          {paid
            ? "Thank you! Your deposit is paid and your appointment is booked."
            : "We haven't received your deposit yet. If you've just paid, refresh this page in a moment."}
        </p>
        <div className="mt-8 space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-6 text-left text-gray-700">
          <p className="text-lg font-semibold text-black">
            {formatLongDate(booking.date)}
          </p>
          <p>
            {formatRange(start, start + booking.durationMin)} (
            {formatDuration(booking.durationMin)})
          </p>
          <p className="pt-2">{booking.serviceName}</p>
          <p className="flex justify-between border-t border-gray-200 pt-3">
            <span>Total</span>
            <span>{formatPrice(booking.price)}</span>
          </p>
          <p className="flex justify-between">
            <span>Deposit {paid ? "paid" : "due"}</span>
            <span>{formatPrice(booking.depositAmount)}</span>
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/account" className={linkPrimary}>
            View My Bookings
          </Link>
          <Link href="/" className={linkGhost}>
            Back to Home
          </Link>
        </div>
      </Frame>
    );
  }

  notFound();
}
