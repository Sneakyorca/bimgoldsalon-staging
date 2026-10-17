import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import StatusPage from "@/components/site/StatusPage";

export const metadata: Metadata = {
  title: "Payment cancelled",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ type?: string }> };

export default async function PaymentCancelled({ searchParams }: Props) {
  const { type } = await searchParams;
  const booking = type === "booking";
  return (
    <StatusPage
      icon={<XCircle className="size-8" aria-hidden="true" />}
      title="Payment cancelled"
      actions={[
        booking
          ? { label: "Book again", href: "/booking" }
          : { label: "Back to cart", href: "/cart" },
        {
          label: booking ? "Back home" : "Keep shopping",
          href: booking ? "/" : "/product",
          variant: "outline",
        },
      ]}
    >
      <p>
        {booking
          ? "You haven't been charged, and your slot has been released. You can book again any time."
          : "You haven't been charged, and your cart is still saved."}
      </p>
    </StatusPage>
  );
}
