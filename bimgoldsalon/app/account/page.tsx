import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CustomerDashboard from "@/components/account/CustomerDashboard";
import { requireUser } from "@/lib/auth/dal";
import { getBookingsForUser, getOrdersForUser } from "@/lib/auth/api";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default async function AccountPage() {
  const user = await requireUser("/account");
  if (user.role === "admin") redirect("/admin");
  const [bookings, orders] = await Promise.all([
    getBookingsForUser(user.id),
    getOrdersForUser(user.id),
  ]);
  return <CustomerDashboard user={user} bookings={bookings} orders={orders} />;
}
