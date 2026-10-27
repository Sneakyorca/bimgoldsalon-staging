import type { BookingView, OrderView } from "@/lib/auth/api";
import {
  formatDuration,
  formatLongDate,
  formatRange,
  parseHHMM,
} from "@/lib/booking";
import { parking } from "@/lib/salon";
import { countryName } from "@/lib/countries";
import { deliveryOptions } from "@/lib/delivery-options";
import { BRAND, siteUrl } from "./brand";
import { splitName } from "@/lib/variants";

export type Built = { subject: string; html: string };
export type BookingEmail = BookingView & {
  cancellationHours: number;
  lines: { name: string; price: number; durationMin: number }[];
};
export type ApplicationEmail = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  applicationType: string;
};

/* ---------- helpers ---------- */
const INK = "#1c1c1c";
const MUTED = "#6b6b6b";
const LINE = "#eeeae5";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const gbp = (n: number) => `£${n.toFixed(2)}`;
const first = (name: string) => name.trim().split(/\s+/)[0] || "there";
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
const ref = (id: string) => `BK-${id.slice(0, 8).toUpperCase()}`;
const whenOf = (b: BookingView) => {
  const s = parseHHMM(b.time);
  return {
    date: formatLongDate(b.date),
    time: formatRange(s, s + b.durationMin),
  };
};

const h1 = (t: string) =>
  `<h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:${INK};">${esc(t)}</h1>`;
const p = (t: string) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">${esc(t)}</p>`;
const small = (t: string) =>
  `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:${MUTED};">${esc(t)}</p>`;

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;"><tr><td style="background:${BRAND.color};border-radius:999px;"><a href="${esc(href)}" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">${esc(label)}</a></td></tr></table>`;

const badge = (text: string, kind: "ok" | "warn" | "bad") => {
  const c = {
    ok: ["#e6f4ea", "#1e7e34", "#b7e1c1"],
    warn: ["#fff4e0", "#a15c00", "#f3d49b"],
    bad: ["#fdecea", "#b3261e", "#f2b8b5"],
  }[kind];
  return `<span style="display:inline-block;background:${c[0]};color:${c[1]};border:1px solid ${c[2]};border-radius:4px;padding:5px 12px;font-size:12px;font-weight:bold;letter-spacing:1.5px;">${esc(text)}</span>`;
};

const box = (title: string, html: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="background:#f9f8f6;border-radius:8px;padding:16px 18px;font-size:14px;line-height:1.6;color:#444;"><div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a8580;margin-bottom:6px;">${esc(title)}</div>${html}</td></tr></table>`;

const kv = (rows: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;font-size:14px;color:${MUTED};width:38%;vertical-align:top;">${esc(k)}</td><td style="padding:6px 0;font-size:14px;color:${INK};vertical-align:top;">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`;

const invoiceHead = (
  label: string,
  number: string,
  sub: string,
  status: string,
  kind: "ok" | "warn" | "bad",
) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;border-top:1px solid ${LINE};border-bottom:1px solid ${LINE};"><tr><td style="padding:16px 0;"><div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8580;">${esc(label)}</div><div style="margin-top:4px;font-size:20px;font-weight:bold;color:${INK};">${esc(number)}</div><div style="margin-top:2px;font-size:13px;color:${MUTED};">${esc(sub)}</div></td><td align="right" valign="top" style="padding:16px 0;">${badge(status, kind)}</td></tr></table>`;

const th = `padding:8px 0;border-bottom:2px solid ${LINE};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a8580;`;

/** First line is the item name. A second line (the options) shows smaller underneath. */
const cellText = (s: string) => {
  const [head, ...rest] = s.split("\n");
  return `${esc(head)}${
    rest.length
      ? `<div style="margin-top:2px;font-size:12px;color:${MUTED};">${esc(rest.join(" "))}</div>`
      : ""
  }`;
};
const itemLabel = (name: string) => {
  const { title, options } = splitName(name);
  return options ? `${title}\n${options}` : title;
};

const lineTable = (
  head: [string, string, string],
  rows: [string, string, string][],
) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><th align="left" style="${th}">${esc(head[0])}</th><th align="center" style="${th}">${esc(head[1])}</th><th align="right" style="${th}">${esc(head[2])}</th></tr>${rows
    .map(
      (r) =>
        `<tr><td style="padding:12px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};">${cellText(r[0])}</td><td align="center" style="padding:12px 8px;border-bottom:1px solid ${LINE};font-size:14px;color:${MUTED};">${esc(r[1])}</td><td align="right" style="padding:12px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};">${esc(r[2])}</td></tr>`,
    )
    .join("")}</table>`;

const totals = (rows: [string, string, boolean?][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr><td align="right"><table role="presentation" cellpadding="0" cellspacing="0" style="width:270px;">${rows
    .map(([k, v, bold]) => {
      const s = `padding:7px 0;font-size:${bold ? 16 : 14}px;font-weight:${bold ? "bold" : "normal"};${bold ? `border-top:2px solid ${INK};` : ""}`;
      return `<tr><td style="${s}color:${bold ? INK : MUTED};">${esc(k)}</td><td align="right" style="${s}color:${INK};">${esc(v)}</td></tr>`;
    })
    .join("")}</table></td></tr></table>`;

function layout(o: { title: string; preheader: string; body: string }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(o.title)}</title></head><body style="margin:0;padding:0;background:#f4f2ef;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(o.preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ef;padding:24px 12px;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:${INK};"><tr><td style="background:${BRAND.color};padding:28px 32px;text-align:center;"><div style="color:#ffffff;font-size:22px;letter-spacing:4px;font-weight:bold;">BIM - GOLD</div><div style="color:#d9dcec;font-size:11px;letter-spacing:3px;margin-top:4px;">HAIR &amp; BEAUTY SALON</div></td></tr><tr><td style="padding:32px;">${o.body}</td></tr><tr><td style="background:#f9f8f6;padding:22px 32px;font-size:12px;line-height:1.7;color:${MUTED};text-align:center;">${esc(BRAND.name)}<br>${esc(BRAND.address)}<br>${esc(BRAND.phone)} · ${esc(BRAND.hours)}<br><a href="${esc(siteUrl())}" style="color:${BRAND.color};">${esc(siteUrl().replace(/^https?:\/\//, ""))}</a></td></tr></table></td></tr></table></body></html>`;
}

/* ---------- orders ---------- */
export function orderInvoiceEmail(o: OrderView): Built {
  const option = deliveryOptions.find((d) => d.id === o.deliveryMethod);
  const pickup = o.deliveryMethod === "pickup";
  const subtotal =
    o.subtotal ?? o.items.reduce((n, i) => n + i.price * i.quantity, 0);
  const fee = o.deliveryFee ?? 0;

  const where = pickup
    ? box(
        "Collect from",
        `${esc(BRAND.name)}<br>${esc(option?.address ?? BRAND.address)}<br><span style="color:${MUTED};">${esc(BRAND.hours)}</span>`,
      )
    : box(
        "Delivering to",
        `${esc(o.customerName)}<br>${esc(o.address)}<br>${esc(o.city)}${o.state ? `, ${esc(o.state)}` : ""}<br>${esc(o.postcode)}<br>${esc(countryName(o.country ?? "GB"))}`,
      );

  const body =
    h1(`Thank you, ${first(o.customerName)}!`) +
    p(
      "We've received your payment and your order is confirmed. Here's your invoice.",
    ) +
    invoiceHead("Invoice", `INV-${o.id}`, day(o.createdAt), "PAID", "ok") +
    lineTable(
      ["Item", "Qty", "Price"],
      o.items.map((i) => [
        itemLabel(i.name),
        String(i.quantity),
        gbp(i.price * i.quantity),
      ]),
    ) +
    totals([
      ["Subtotal", gbp(subtotal)],
      [option?.label ?? "Delivery", fee === 0 ? "Free" : gbp(fee)],
      ["Total paid", gbp(o.total), true],
    ]) +
    where +
    (o.notes ? box("Your order notes", esc(o.notes)) : "") +
    button(`${siteUrl()}/account`, "View my orders") +
    small(
      "Paid online by card through Stripe. Questions? Just reply to this email.",
    );

  return {
    subject: `Your invoice INV-${o.id} – payment received`,
    html: layout({
      title: `Invoice INV-${o.id}`,
      preheader: `Payment received for order #${o.id} · ${gbp(o.total)}`,
      body,
    }),
  };
}

export function orderStatusEmail(o: OrderView, status: string): Built | null {
  const pickup = o.deliveryMethod === "pickup";
  const hi = p(`Hi ${first(o.customerName)},`);
  const link = button(`${siteUrl()}/account`, "View my orders");
  let title = "";
  let text = "";
  let extra = "";

  if (status === "shipped") {
    title = pickup
      ? "Your order is ready to collect"
      : "Your order is on its way";
    text = pickup
      ? `Your order #${o.id} is ready. Please collect it from the salon during opening hours (${BRAND.hours}).`
      : `Your order #${o.id} has been dispatched for next-day delivery to ${o.postcode}.`;
    if (pickup)
      extra = box(
        "Collect from",
        `${esc(BRAND.name)}<br>${esc(BRAND.address)}`,
      );
  } else if (status === "delivered") {
    title = pickup
      ? "Thanks for collecting your order"
      : "Your order has been delivered";
    text = `Order #${o.id} is complete. We hope you love it, and thank you for shopping with us.`;
  } else if (status === "cancelled") {
    title = "Your order has been cancelled";
    text = `Order #${o.id} has been cancelled. If you've already paid, we'll be in touch about your refund. Questions? Just reply to this email.`;
  } else return null;

  return {
    subject: `${title} – order #${o.id}`,
    html: layout({
      title,
      preheader: text,
      body: h1(title) + hi + p(text) + extra + link,
    }),
  };
}

/* ---------- bookings ---------- */
const appointmentBox = (b: BookingView) => {
  const w = whenOf(b);
  return box(
    "Your appointment",
    `<strong style="font-size:16px;color:${INK};">${esc(w.date)}</strong><br>${esc(w.time)} (${esc(formatDuration(b.durationMin))})<br><span style="color:${MUTED};">${esc(BRAND.address)}</span>`,
  );
};
const policyBox = (b: BookingEmail) =>
  box(
    "Good to know",
    `Need to cancel? You can do it from your account up to ${b.cancellationHours} hours before your appointment. Deposits are non-refundable.`,
  );

/** Deposit paid: booking confirmation and receipt in one */
export function bookingPaidEmail(b: BookingEmail): Built {
  const balance = Math.max(0, b.price - b.depositAmount);
  const w = whenOf(b);
  const body =
    h1(`You're booked, ${first(b.customerName)}!`) +
    p(
      "Your deposit has been received and your appointment is confirmed. Here's your receipt.",
    ) +
    invoiceHead(
      "Deposit receipt",
      `RCT-${ref(b.id)}`,
      `Booking ${ref(b.id)}`,
      "PAID",
      "ok",
    ) +
    appointmentBox(b) +
    lineTable(
      ["Service", "Duration", "Price"],
      b.lines.map((l) => [l.name, formatDuration(l.durationMin), gbp(l.price)]),
    ) +
    totals([
      ["Service total", gbp(b.price)],
      ["Deposit paid today", gbp(b.depositAmount)],
      ["Balance due at the salon", gbp(balance), true],
    ]) +
    policyBox(b) +
    button(`${siteUrl()}/account`, "View my bookings");
  return {
    subject: `Booking confirmed – ${w.date}, ${w.time.split("-")[0]}`,
    html: layout({
      title: "Booking confirmed",
      preheader: `${w.date}, ${w.time} · deposit ${gbp(b.depositAmount)} received`,
      body,
    }),
  };
}

/** No deposit to pay: the salon will confirm */
export function bookingReceivedEmail(b: BookingEmail): Built {
  const w = whenOf(b);
  const body =
    h1(`We've got your booking, ${first(b.customerName)}`) +
    p(
      "Thank you! The salon will confirm your appointment shortly and be in touch if anything changes.",
    ) +
    appointmentBox(b) +
    lineTable(
      ["Service", "Duration", "Price"],
      b.lines.map((l) => [l.name, formatDuration(l.durationMin), gbp(l.price)]),
    ) +
    totals([["Total", gbp(b.price), true]]) +
    policyBox(b) +
    button(`${siteUrl()}/account`, "View my bookings") +
    small(`Booking reference ${ref(b.id)}`);
  return {
    subject: `Booking received – ${w.date}`,
    html: layout({
      title: "Booking received",
      preheader: `${w.date}, ${w.time} · waiting for the salon to confirm`,
      body,
    }),
  };
}

export function bookingStatusEmail(
  b: BookingEmail,
  status: string,
): Built | null {
  const w = whenOf(b);
  const hi = p(`Hi ${first(b.customerName)},`);
  if (status === "confirmed")
    return {
      subject: `Your booking is confirmed – ${w.date}`,
      html: layout({
        title: "Booking confirmed",
        preheader: `${w.date}, ${w.time}`,
        body:
          h1("Your booking is confirmed") +
          hi +
          p(
            "Great news, the salon has confirmed your appointment. We look forward to seeing you!",
          ) +
          appointmentBox(b) +
          lineTable(
            ["Service", "Duration", "Price"],
            b.lines.map((l) => [
              l.name,
              formatDuration(l.durationMin),
              gbp(l.price),
            ]),
          ) +
          totals([["Total", gbp(b.price), true]]) +
          policyBox(b) +
          button(`${siteUrl()}/account`, "View my bookings") +
          small(`Booking reference ${ref(b.id)}`),
      }),
    };
  if (status === "cancelled")
    return {
      subject: `Your booking has been cancelled – ${w.date}`,
      html: layout({
        title: "Booking cancelled",
        preheader: `${w.date}, ${w.time}`,
        body:
          h1("Your booking has been cancelled") +
          hi +
          p(
            b.isPaid
              ? "Your appointment below has been cancelled. We'll be in touch about your deposit."
              : "Your appointment below has been cancelled.",
          ) +
          appointmentBox(b) +
          button(`${siteUrl()}/booking`, "Book again") +
          small(`Booking reference ${ref(b.id)}`),
      }),
    };
  return null;
}

/* ---------- for the salon ---------- */
const adminLink = () => button(`${siteUrl()}/admin`, "Open the admin");

export function adminOrderEmail(o: OrderView): Built {
  const option = deliveryOptions.find((d) => d.id === o.deliveryMethod);
  const body =
    h1(`New paid order #${o.id}`) +
    kv([
      ["Customer", o.customerName],
      ["Email", o.customerEmail],
      ["Phone", o.customerPhone],
      ["Delivery", option?.label ?? "Delivery"],
      [
        "Address",
        o.deliveryMethod === "pickup"
          ? "Customer will collect"
          : `${o.address}, ${o.city}, ${o.postcode}`,
      ],
      ...(o.notes ? ([["Notes", o.notes]] as [string, string][]) : []),
    ]) +
    lineTable(
      ["Item", "Qty", "Price"],
      o.items.map((i) => [
        itemLabel(i.name),
        String(i.quantity),
        gbp(i.price * i.quantity),
      ]),
    ) +
    totals([["Total paid", gbp(o.total), true]]) +
    adminLink();
  return {
    subject: `New paid order #${o.id} – ${gbp(o.total)}`,
    html: layout({
      title: `New order #${o.id}`,
      preheader: `${o.customerName} · ${gbp(o.total)}`,
      body,
    }),
  };
}

export function adminBookingEmail(b: BookingEmail, heading: string): Built {
  const w = whenOf(b);
  const body =
    h1(heading) +
    kv([
      ["Customer", b.customerName],
      ["Email", b.customerEmail],
      ["Phone", b.customerPhone],
      ["Date", w.date],
      ["Time", `${w.time} (${formatDuration(b.durationMin)})`],
      ["Services", b.serviceName],
      ["Total", gbp(b.price)],
      [
        "Deposit",
        `${gbp(b.depositAmount)} ${b.isPaid ? "(paid)" : "(unpaid)"}`,
      ],
    ]) +
    adminLink();
  return {
    subject: `${heading} – ${b.customerName}, ${w.date}`,
    html: layout({
      title: heading,
      preheader: `${b.customerName} · ${w.date}, ${w.time}`,
      body,
    }),
  };
}

export function adminLowStockEmail(
  rows: { name: string; stock: number }[],
): Built {
  const body =
    h1("Stock is running low") +
    p(
      "These products have just dropped to the low-stock line or below after a new order.",
    ) +
    lineTable(
      ["Product", "Left", ""],
      rows.map((r) => [
        r.name,
        r.stock <= 0 ? "Out of stock" : String(r.stock),
        "",
      ]),
    ) +
    adminLink();
  return {
    subject: `Low stock: ${rows.length} product${rows.length === 1 ? "" : "s"} need restocking`,
    html: layout({
      title: "Low stock",
      preheader: rows.map((r) => r.name).join(", "),
      body,
    }),
  };
}

/* ---------- training applications ---------- */
export function applicationReceivedEmail(a: ApplicationEmail): Built {
  const body =
    h1(`Thanks for applying, ${first(a.fullName)}!`) +
    p(
      `We've received your application (${a.applicationType}). A member of the team will contact you soon.`,
    ) +
    small("If you didn't send this application, you can ignore this email.");
  return {
    subject: "We've received your application",
    html: layout({
      title: "Application received",
      preheader: "We'll be in touch soon",
      body,
    }),
  };
}

export function adminApplicationEmail(a: ApplicationEmail): Built {
  const body =
    h1("New training application") +
    kv([
      ["Name", a.fullName],
      ["Email", a.email],
      ["Phone", a.phone],
      ["Applying for", a.applicationType],
    ]) +
    adminLink();
  return {
    subject: `New training application – ${a.fullName}`,
    html: layout({
      title: "New application",
      preheader: `${a.fullName} · ${a.applicationType}`,
      body,
    }),
  };
}
/* ---------- waitlist ---------- */
export function waitlistSlotEmail(e: {
  name: string;
  serviceNames: string;
  preferredDate: string;
}): Built {
  const date = formatLongDate(e.preferredDate);
  const body =
    h1("A time may have opened up") +
    p(`Hi ${first(e.name)},`) +
    p(
      `Good news: someone has cancelled, so a time may now be free on ${date} for ${e.serviceNames}. Times go quickly and are first come, first served.`,
    ) +
    button(`${siteUrl()}/booking`, "Book now") +
    small(
      "You're receiving this because you joined our waitlist for this day.",
    );
  return {
    subject: `A time may have opened up on ${date}`,
    html: layout({
      title: "A time may have opened up",
      preheader: `${date} · ${e.serviceNames}`,
      body,
    }),
  };
}
/* ---------- reminders ---------- */
export function bookingReminderEmail(b: BookingEmail): Built {
  const w = whenOf(b);
  const balance = Math.max(0, b.price - b.depositAmount);
  const body =
    h1(`See you soon, ${first(b.customerName)}`) +
    p("A quick reminder about your appointment.") +
    appointmentBox(b) +
    lineTable(
      ["Service", "Duration", "Price"],
      b.lines.map((l) => [l.name, formatDuration(l.durationMin), gbp(l.price)]),
    ) +
    totals(
      b.isPaid
        ? [
            ["Service total", gbp(b.price)],
            ["Deposit paid", gbp(b.depositAmount)],
            ["Balance due at the salon", gbp(balance), true],
          ]
        : [["Total", gbp(b.price), true]],
    ) +
    box(
      "Getting here",
      `${esc(BRAND.address)}<br>Nearest car park: ${esc(parking.name)}, ${esc(parking.postcode)}. ${esc(parking.note)}`,
    ) +
    box(
      "Before you come",
      "Please arrive on time, with your hair detangled and ready for your style. Come on your own unless your guest has their own appointment.",
    ) +
    policyBox(b) +
    button(`${siteUrl()}/account`, "View my booking") +
    small(`Booking reference ${ref(b.id)}`);
  return {
    subject: `Reminder: your appointment on ${w.date}, ${w.time.split("-")[0]}`,
    html: layout({
      title: "Appointment reminder",
      preheader: `${w.date}, ${w.time}`,
      body,
    }),
  };
}

export function cartReminderEmail(o: {
  name: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  unsubscribeUrl: string;
  second: boolean;
}): Built {
  const body =
    h1(
      o.second
        ? `Your basket is still here, ${first(o.name)}`
        : `You left something behind, ${first(o.name)}`,
    ) +
    p("The items below are still in your basket whenever you're ready.") +
    lineTable(
      ["Item", "Qty", "Price"],
      o.items.map((i) => [
        itemLabel(i.name),
        String(i.quantity),
        gbp(i.price * i.quantity),
      ]),
    ) +
    totals([["Basket total", gbp(o.total), true]]) +
    button(`${siteUrl()}/cart`, "Back to my basket") +
    small("Delivery is worked out at checkout.") +
    `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:${MUTED};">Don't want basket reminders? <a href="${esc(o.unsubscribeUrl)}" style="color:${MUTED};">Unsubscribe</a>.</p>`;
  return {
    subject: o.second
      ? "Your basket is still waiting"
      : "You left something in your basket",
    html: layout({
      title: "Your basket",
      preheader: `${o.items.length} item${o.items.length === 1 ? "" : "s"} waiting for you`,
      body,
    }),
  };
}
