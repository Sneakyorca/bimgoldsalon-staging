import { XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { abandonBookingPayment, abandonOrderPayment } from "@/Data/payments";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Payment cancelled",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ type?: string; id?: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PaymentCancelledPage({ searchParams }: Props) {
  const { type, id } = await searchParams;
  const user = await requireUser("/account");

  // Close the unpaid payment page and give back the stock or the time slot
  let outcome: "paid" | "released" | "none" = "none";
  if (type === "order" && id && /^\d{1,12}$/.test(id))
    outcome = await abandonOrderPayment(user.id, Number(id));
  else if (type === "booking" && id && UUID.test(id))
    outcome = await abandonBookingPayment(user.id, id);

  // It was paid after all (for example in another tab)
  if (outcome === "paid") redirect("/account");

  const isBooking = type === "booking";
  return (
    <section className="flex items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="size-10 text-red-600" />
        </div>
        <h1 className="mt-8 text-4xl font-semibold text-black">
          Payment cancelled
        </h1>
        <p className="mt-4 leading-7 text-gray-600">
          {isBooking
            ? "No payment was taken and your time slot has been released. You can book again whenever you're ready."
            : "No payment was taken. Your cart is still saved, so you can try again whenever you're ready."}
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href={isBooking ? "/booking" : "/cart"}
            className="rounded-full bg-black px-8 py-3 text-white transition hover:opacity-90"
          >
            {isBooking ? "Book again" : "Back to cart"}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-black px-8 py-3 text-black transition hover:bg-black hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
