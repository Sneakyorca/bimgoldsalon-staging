import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderForUser } from "@/Data/orders";
import { deliveryOptions } from "@/lib/delivery-options";
import { requireUser } from "@/lib/auth/dal";
import { countryName } from "@/lib/countries";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order received | BIM-GOLD",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ id?: string }> };

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const user = await requireUser("/account");
  if (!id || !/^\d{1,12}$/.test(id)) notFound();
  const order = await getOrderForUser(user.id, id);
  if (!order) notFound();

  const option = deliveryOptions.find((o) => o.id === order.deliveryMethod);

  return (
    <section className="flex items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="size-10 text-green-600" />
        </div>
        <h1 className="mt-8 text-4xl font-semibold text-black">
          Order received!
        </h1>
        <p className="mt-2 text-gray-600">Order #{order.id}</p>
        <p className="mt-4 leading-7 text-gray-600">
          Thank you for your order. The salon will be in touch shortly to
          arrange payment, and we&apos;ll keep you updated about delivery.
        </p>

        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 text-left">
          <h2 className="mb-3 text-lg font-semibold">Your order</h2>
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
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal ?? order.total)}</span>
            </p>
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
          <div className="mt-4 border-t border-gray-200 pt-4 text-[15px] text-gray-700">
            {order.deliveryMethod === "pickup" ? (
              <p>
                <b>Collect from:</b> {option?.address}
              </p>
            ) : (
              <p>
                <b>Delivering to:</b> {order.customerName}, {order.address},{" "}
                {order.city}
                {order.state ? `, ${order.state}` : ""}, {order.postcode},{" "}
                {countryName(order.country ?? "GB")}
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/product"
            className="rounded-full bg-black px-8 py-3 text-white transition hover:opacity-90"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-black px-8 py-3 text-black transition hover:bg-black hover:text-white"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </section>
  );
}
