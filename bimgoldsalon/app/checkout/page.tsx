import type { Metadata } from "next";
import CheckoutView from "@/components/checkout/CheckoutView";
import { requireUser } from "@/lib/auth/dal";
import { toE164 } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Checkout | BIM-GOLD",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const [first = "", ...rest] = user.name.trim().split(/\s+/);
  return (
    <CheckoutView
      defaults={{
        firstName: first,
        lastName: rest.join(" "),
        email: user.email,
        phone: toE164(user.phone),
      }}
    />
  );
}
