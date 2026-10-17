import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import StatusPage from "@/components/site/StatusPage";
import { requireUser } from "@/lib/auth/dal";
import { getBookingsForUser, getOrdersForUser } from "@/lib/auth/api";
import { formatGBP } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Payment received",
  robots: { index: false },
};
type Props = { searchParams: Promise<{ type?: string; id?: string }> };

export default async function PaymentSuccess({ searchParams }: Props) {
  const { type, id } = await searchParams;
  const user = await requireUser("/payment/success");
  const booking = type === "booking";
  const record = booking
    ? (await getBookingsForUser(user.id)).find((item) => item.id === id)
    : (await getOrdersForUser(user.id)).find((item) => item.id === id);
  if (!record || (type !== "booking" && type !== "order"))
    return (
      <StatusPage
        title="We couldn't find that payment"
        actions={[
          { label: "Go to my account", href: "/account" },
          { label: "Back home", href: "/", variant: "outline" },
        ]}
      >
        <p>If you were charged, contact the salon and quote your reference.</p>
      </StatusPage>
    );
  const rows: [string, string][] =
    "serviceName" in record
      ? [
          ["Service", record.serviceName],
          [
            "Date",
            `${new Date(record.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} at ${record.time}`,
          ],
          [
            "Paid",
            record.depositAmount === 0
              ? "Free"
              : formatGBP(record.depositAmount),
          ],
        ]
      : [
          [
            "Items",
            record.items
              .map((item) => `${item.quantity} x ${item.name}`)
              .join(", "),
          ],
          ["Total paid", formatGBP(record.total)],
        ];
  return (
    <StatusPage
      icon={<CheckCircle2 className="size-8" aria-hidden="true" />}
      title={booking ? "Your booking is confirmed" : "Your order is confirmed"}
      actions={[
        {
          label: booking ? "View my bookings" : "View my orders",
          href: "/account",
        },
        {
          label: booking ? "Back home" : "Keep shopping",
          href: booking ? "/" : "/product",
          variant: "outline",
        },
      ]}
    >
      <p>
        Reference: <span className="font-semibold text-black">{record.id}</span>
      </p>
      <dl className="space-y-2 rounded-2xl bg-card p-5 text-left text-[15px]">
        {rows.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4">
            <dt className="text-gray-600">{key}</dt>
            <dd className="text-right font-semibold text-black">{value}</dd>
          </div>
        ))}
      </dl>
    </StatusPage>
  );
}
