import "server-only";
import { after } from "next/server";
import { getApplicationById } from "@/Data/applications";
import { getBookingByIdAdmin } from "@/Data/bookings";
import { loadCrossedLowStock } from "@/Data/emailData";
import { getOrderByIdAdmin } from "@/Data/orders";
import {
  entriesDueForDate,
  getWaitlistEntryAdmin,
  markWaitlistNotified,
  type WaitlistView,
} from "@/Data/waitlist";
import { sendEmail } from "./send";
import * as t from "./templates";

const adminTo = () =>
  process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM || "";

/** Runs after the page has responded, so emails never slow anything down */
function defer(task: () => Promise<unknown>) {
  const run = () => task().catch((e) => console.error("[email]", e));
  try {
    after(run);
  } catch {
    void run();
  }
}

const toSalon = (m: t.Built) => {
  const to = adminTo();
  return to ? sendEmail({ to, ...m }) : Promise.resolve(false);
};

export function notifyOrderPaid(orderId: number) {
  defer(async () => {
    const order = await getOrderByIdAdmin(orderId);
    if (!order) return;
    await Promise.all([
      sendEmail({
        to: order.customerEmail,
        toName: order.customerName,
        ...t.orderInvoiceEmail(order),
      }),
      toSalon(t.adminOrderEmail(order)),
    ]);
  });
}

export function notifyOrderStatus(orderId: number, status: string) {
  defer(async () => {
    const order = await getOrderByIdAdmin(orderId);
    const built = order ? t.orderStatusEmail(order, status) : null;
    if (order && built)
      await sendEmail({
        to: order.customerEmail,
        toName: order.customerName,
        ...built,
      });
  });
}

/** An order may have pushed a product to the low-stock line */
export function notifyLowStock(orderId: number) {
  defer(async () => {
    if (!adminTo()) return;
    const rows = await loadCrossedLowStock(orderId);
    if (rows.length > 0) await toSalon(t.adminLowStockEmail(rows));
  });
}

/** Deposit paid: confirmation and receipt for the customer, alert for the salon */
export function notifyBookingPaid(bookingId: string) {
  defer(async () => {
    const b = await getBookingByIdAdmin(bookingId);
    if (!b) return;
    await Promise.all([
      sendEmail({
        to: b.customerEmail,
        toName: b.customerName,
        ...t.bookingPaidEmail(b),
      }),
      toSalon(t.adminBookingEmail(b, "New booking (deposit paid)")),
    ]);
  });
}

/** Booking made with nothing to pay online: the salon still has to confirm it */
export function notifyBookingCreated(bookingId: string) {
  defer(async () => {
    const b = await getBookingByIdAdmin(bookingId);
    if (!b) return;
    await Promise.all([
      sendEmail({
        to: b.customerEmail,
        toName: b.customerName,
        ...t.bookingReceivedEmail(b),
      }),
      toSalon(t.adminBookingEmail(b, "New booking (needs confirming)")),
    ]);
  });
}

async function sendWaitlistEmails(entries: WaitlistView[]) {
  await Promise.all(
    entries.map((e) =>
      sendEmail({ to: e.email, toName: e.name, ...t.waitlistSlotEmail(e) }),
    ),
  );
  await markWaitlistNotified(entries.map((e) => e.id));
}

export function notifyBookingStatus(
  bookingId: string,
  status: string,
  opts: { byCustomer?: boolean } = {},
) {
  if (status !== "confirmed" && status !== "cancelled") return;
  defer(async () => {
    const b = await getBookingByIdAdmin(bookingId);
    const built = b ? t.bookingStatusEmail(b, status) : null;
    if (!b || !built) return;
    await Promise.all([
      sendEmail({ to: b.customerEmail, toName: b.customerName, ...built }),
      opts.byCustomer
        ? toSalon(t.adminBookingEmail(b, "Booking cancelled by the customer"))
        : Promise.resolve(false),
    ]);
    // a cancelled booking frees a time, so tell the people waiting for that day
    if (status === "cancelled") {
      const waiting = await entriesDueForDate(b.date);
      if (waiting.length > 0) await sendWaitlistEmails(waiting);
    }
  });
}

/** The admin pressed "Email now" on one waitlist entry */
export function notifyWaitlistEntry(entryId: string) {
  defer(async () => {
    const e = await getWaitlistEntryAdmin(entryId);
    if (e) await sendWaitlistEmails([e]);
  });
}

export function notifyApplication(applicationId: string) {
  defer(async () => {
    const a = await getApplicationById(applicationId);
    if (!a) return;
    await Promise.all([
      sendEmail({
        to: a.email,
        toName: a.fullName,
        ...t.applicationReceivedEmail(a),
      }),
      toSalon(t.adminApplicationEmail(a)),
    ]);
  });
}
