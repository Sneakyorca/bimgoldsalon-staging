import "server-only";
import type Stripe from "stripe";
import { formatLongDate, formatTime } from "@/lib/booking";
import { notifyBookingPaid, notifyOrderPaid } from "@/lib/email/notify";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { splitName } from "@/lib/variants";

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
const pence = (n: number) => Math.round(n * 100);
// 30 minutes is the shortest time Stripe lets a payment page stay open
const expiresAt = () => Math.floor(Date.now() / 1000) + 30 * 60;
const idOf = (v: string | { id: string } | null | undefined) =>
  typeof v === "string" ? v : (v?.id ?? null);

export type AbandonOutcome = "paid" | "released" | "none";

// ---- Opening Stripe's payment page ---------------------------------------

/** Payment page for a saved order. Amounts come from the database, not the browser. */
export async function createOrderCheckout(
  orderId: number,
  email: string,
): Promise<string> {
  const db = createAdminClient();
  const { data: order, error } = await db
    .from("orders")
    .select("id, delivery_fee, order_items(name, price, quantity)")
    .eq("id", orderId)
    .single();
  if (error || !order) throw new Error("Order not found");

  const items = (order.order_items ?? []) as {
    name: string;
    price: number | string;
    quantity: number;
  }[];
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (i) => {
      const { title, options } = splitName(i.name);
      return {
        quantity: i.quantity,
        price_data: {
          currency: "gbp",
          unit_amount: pence(Number(i.price)),
          product_data: {
            name: title.slice(0, 250),
            ...(options ? { description: options.slice(0, 500) } : {}),
          },
        },
      };
    },
  );
  const fee = Number(order.delivery_fee);
  if (fee > 0)
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: pence(fee),
        product_data: { name: "Delivery" },
      },
    });

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: email,
    client_reference_id: `order_${orderId}`,
    metadata: { type: "order", order_id: String(orderId) },
    payment_intent_data: {
      metadata: { type: "order", order_id: String(orderId) },
    },
    success_url: `${siteUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/payment/cancelled?type=order&id=${orderId}`,
    expires_at: expiresAt(),
  });
  if (!session.url) throw new Error("Stripe returned no payment page address");

  await db
    .from("orders")
    .update({ stripe_session_id: session.id })
    .eq("id", orderId);
  return session.url;
}

/** Payment page for a booking's deposit */
export async function createBookingCheckout(
  bookingId: string,
  email: string,
): Promise<string> {
  const db = createAdminClient();
  const { data: b, error } = await db
    .from("bookings")
    .select(
      "id, booking_date, start_min, deposit_amount, booking_services(service_name, sort_order)",
    )
    .eq("id", bookingId)
    .single();
  if (error || !b) throw new Error("Booking not found");

  const names = [
    ...((b.booking_services ?? []) as {
      service_name: string;
      sort_order: number;
    }[]),
  ]
    .sort((x, y) => x.sort_order - y.sort_order)
    .map((s) => s.service_name);

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: pence(Number(b.deposit_amount)),
          product_data: {
            name: "Booking deposit",
            description:
              `${names.join(", ")} · ${formatLongDate(b.booking_date)} at ${formatTime(b.start_min)}`.slice(
                0,
                500,
              ),
          },
        },
      },
    ],
    customer_email: email,
    client_reference_id: `booking_${bookingId}`,
    metadata: { type: "booking", booking_id: bookingId },
    payment_intent_data: {
      metadata: { type: "booking", booking_id: bookingId },
    },
    success_url: `${siteUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/payment/cancelled?type=booking&id=${bookingId}`,
    expires_at: expiresAt(),
  });
  if (!session.url) throw new Error("Stripe returned no payment page address");

  await db
    .from("bookings")
    .update({ stripe_session_id: session.id })
    .eq("id", bookingId);
  return session.url;
}

// ---- Recording the result -------------------------------------------------

/**
 * A payment went through: mark the order or booking paid and send the emails.
 * Safe to run more than once: only the call that actually flips it to paid
 * sends the emails.
 */
export async function fulfilCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.payment_status !== "paid") return;
  const db = createAdminClient();
  const meta = session.metadata ?? {};
  const paymentIntent = idOf(session.payment_intent);
  const paidAt = new Date().toISOString();

  if (meta.type === "order") {
    const id = Number(meta.order_id);
    const { data: order } = await db
      .from("orders")
      .select("id, total, payment_status, stripe_session_id")
      .eq("id", id)
      .maybeSingle();
    if (!order || order.stripe_session_id !== session.id) {
      console.error("[stripe] order/session mismatch", id, session.id);
      return;
    }
    if (order.payment_status === "paid") return;
    if (
      session.currency !== "gbp" ||
      session.amount_total !== pence(Number(order.total))
    ) {
      console.error(
        "[stripe] amount mismatch for order",
        id,
        session.amount_total,
      );
      return;
    }
    const { data: changed } = await db
      .from("orders")
      .update({
        payment_status: "paid",
        stripe_payment_intent: paymentIntent,
        paid_at: paidAt,
      })
      .eq("id", id)
      .neq("payment_status", "paid")
      .select("id");
    if (changed && changed.length > 0) notifyOrderPaid(id);
    return;
  }

  if (meta.type === "booking") {
    const id = meta.booking_id;
    const { data: booking } = await db
      .from("bookings")
      .select("id, deposit_amount, is_paid, stripe_session_id")
      .eq("id", id)
      .maybeSingle();
    if (!booking || booking.stripe_session_id !== session.id) {
      console.error("[stripe] booking/session mismatch", id, session.id);
      return;
    }
    let justPaid = false;
    if (!booking.is_paid) {
      if (
        session.currency !== "gbp" ||
        session.amount_total !== pence(Number(booking.deposit_amount))
      ) {
        console.error(
          "[stripe] amount mismatch for booking",
          id,
          session.amount_total,
        );
        return;
      }
      const { data: changed } = await db
        .from("bookings")
        .update({
          is_paid: true,
          stripe_payment_intent: paymentIntent,
          paid_at: paidAt,
        })
        .eq("id", id)
        .eq("is_paid", false)
        .select("id");
      justPaid = !!changed && changed.length > 0;
    }
    // a paid deposit confirms the appointment
    await db
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", id)
      .eq("status", "pending");
    if (justPaid) notifyBookingPaid(id);
  }
}

/** The payment page expired or failed: release the stock or the time slot */
export async function releaseCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const db = createAdminClient();
  const meta = session.metadata ?? {};

  if (meta.type === "order") {
    const id = Number(meta.order_id);
    const { data: order } = await db
      .from("orders")
      .select("stripe_session_id")
      .eq("id", id)
      .maybeSingle();
    if (order?.stripe_session_id === session.id)
      await db.rpc("release_unpaid_order", { p_order_id: id });
  } else if (meta.type === "booking") {
    await db
      .from("bookings")
      .update({ status: "payment_failed" })
      .eq("id", meta.booking_id)
      .eq("stripe_session_id", session.id)
      .eq("status", "pending")
      .eq("is_paid", false);
  }
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await fulfilCheckoutSession(event.data.object as Stripe.Checkout.Session);
      break;
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      await releaseCheckoutSession(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
  }
}

// ---- Releasing right away ---------------------------------------------------

export async function releaseUnpaidOrder(orderId: number) {
  await createAdminClient().rpc("release_unpaid_order", {
    p_order_id: orderId,
  });
}

export async function releaseUnpaidBooking(bookingId: string) {
  await createAdminClient()
    .from("bookings")
    .update({ status: "payment_failed" })
    .eq("id", bookingId)
    .eq("status", "pending")
    .eq("is_paid", false);
}

/** Closes an unpaid payment page. Returns true if it turns out it was paid after all. */
async function closeSession(sessionId: string): Promise<boolean> {
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      await fulfilCheckoutSession(session);
      return true;
    }
    if (session.status === "open")
      await stripe().checkout.sessions.expire(sessionId);
  } catch (e) {
    console.error("[closeSession]", e);
  }
  return false;
}

/** The customer clicked "back" on Stripe's page */
export async function abandonOrderPayment(
  userId: string,
  orderId: number,
): Promise<AbandonOutcome> {
  const { data: order } = await createAdminClient()
    .from("orders")
    .select("id, user_id, stripe_session_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.user_id !== userId) return "none";
  if (order.stripe_session_id && (await closeSession(order.stripe_session_id)))
    return "paid";
  await releaseUnpaidOrder(orderId);
  return "released";
}

export async function abandonBookingPayment(
  userId: string,
  bookingId: string,
): Promise<AbandonOutcome> {
  const { data: booking } = await createAdminClient()
    .from("bookings")
    .select("id, user_id, stripe_session_id")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking || booking.user_id !== userId) return "none";
  if (
    booking.stripe_session_id &&
    (await closeSession(booking.stripe_session_id))
  )
    return "paid";
  await releaseUnpaidBooking(bookingId);
  return "released";
}
