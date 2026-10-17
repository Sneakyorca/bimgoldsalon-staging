import Link from "next/link";
import { Calendar, LogOut, Package, Pencil } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { btnGhost, btnPrimary, panel } from "@/components/admin/ui";
import StatusPill from "@/components/site/StatusPill";
import type { BookingView, OrderView, PublicUser } from "@/lib/auth/api";
import { formatGBP } from "@/lib/booking";
import { formatDay, formatStamp } from "@/lib/date";
import BookingActions from "@/components/account/BookingActions";

const Empty = ({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) => (
  <div className="mt-5 rounded-2xl border border-dashed border-black/40 bg-[#f9f9f9] px-6 py-10 text-center">
    <p className="text-[20px] font-semibold">{title}</p>
    <p className="mt-1 text-[16px] text-muted-foreground">{body}</p>
    <Link href={href} className={`${btnPrimary} mt-5`}>
      {label}
    </Link>
  </div>
);

type Props = { user: PublicUser; bookings: BookingView[]; orders: OrderView[] };

export default function CustomerDashboard({ user, bookings, orders }: Props) {
  return (
    <main className="mx-auto w-full max-w-360 px-5 pb-16 pt-4 lg:px-12">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-muted-foreground">
        My account
      </p>
      <h1 className="mt-1 text-[32px] font-bold leading-tight md:text-[40px]">
        Welcome back, {user.name.split(" ")[0] || "there"}
      </h1>
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className={`${panel} md:min-w-80`}>
          <p className="text-[20px] font-semibold">{user.name}</p>
          <p className="mt-1 text-[16px] text-muted-foreground">{user.email}</p>
          {user.phone && (
            <p className="text-[16px] text-muted-foreground">{user.phone}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/profile/edit" className={btnGhost}>
            <Pencil className="size-4" aria-hidden="true" /> Edit profile
          </Link>
          <form action={signOutAction}>
            <button type="submit" className={btnPrimary}>
              <LogOut className="size-4" aria-hidden="true" /> Log out
            </button>
          </form>
        </div>
      </div>
      <section aria-labelledby="bookings-heading" className="mt-12">
        <h2
          id="bookings-heading"
          className="flex items-center gap-2 text-[22px] font-semibold"
        >
          <Calendar className="size-5 text-primary" aria-hidden="true" /> My
          bookings
        </h2>
        {bookings.length === 0 ? (
          <Empty
            title="No bookings yet"
            body="When you book a service, it will show up here."
            href="/booking"
            label="Book a service"
          />
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {bookings.map((booking) => (
              <li key={booking.id} className={panel}>
                <p className="text-[14px] text-muted-foreground">
                  {formatDay(booking.date)} · {booking.time}
                </p>
                <p className="mt-1 text-[20px] font-semibold">
                  {booking.serviceName}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="flex flex-wrap gap-2">
                    <StatusPill value={booking.status} />
                    <StatusPill value={booking.isPaid ? "paid" : "unpaid"} />
                  </span>
                  <span className="text-right text-[16px] font-bold">
                    <span className="block text-[12px] font-normal text-muted-foreground">
                      Deposit
                    </span>
                    {formatGBP(booking.depositAmount)}
                  </span>
                </div>
                <BookingActions booking={booking} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="orders-heading" className="mt-12">
        <h2
          id="orders-heading"
          className="flex items-center gap-2 text-[22px] font-semibold"
        >
          <Package className="size-5 text-primary" aria-hidden="true" /> My
          orders
        </h2>
        {orders.length === 0 ? (
          <Empty
            title="No orders yet"
            body="Products you order will appear here."
            href="/product"
            label="Browse products"
          />
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {orders.map((order) => (
              <li key={order.id} className={panel}>
                <p className="text-[14px] text-muted-foreground">
                  {formatStamp(order.createdAt)} · #{order.id}
                </p>
                <ul className="mt-1 text-[16px]">
                  {order.items.map((item) => (
                    <li key={`${order.id}-${item.productId}`}>
                      {item.quantity} x {item.name}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="flex flex-wrap gap-2">
                    <StatusPill value={order.orderStatus} />
                    <StatusPill value={order.paymentStatus} />
                  </span>
                  <span className="text-[16px] font-bold">
                    {formatGBP(order.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
