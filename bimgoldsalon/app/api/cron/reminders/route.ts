import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getBookingByIdAdmin } from "@/Data/bookings";
import { getProducts } from "@/Data/products";
import {
  claimBookingReminder,
  clearSavedCart,
  hasPaidOrderSince,
  hasPriorPurchase,
  listBookingsToRemind,
  listDueCarts,
  recordCartReminder,
  releaseBookingReminder,
  type SavedCart,
} from "@/Data/reminders";
import { sendEmail } from "@/lib/email/send";
import * as t from "@/lib/email/templates";
import { inQuietHours, reminderConfig, unsubscribeUrl } from "@/lib/reminders";

export const dynamic = "force-dynamic";

type Product = Awaited<ReturnType<typeof getProducts>>[number];
type Cfg = ReturnType<typeof reminderConfig>;

const mask = (email: string) => email.replace(/^(.).*(@.*)$/, "$1***$2");

function authorised(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = req.headers.get("authorization") ?? "";
  const want = `Bearer ${secret}`;
  return (
    given.length === want.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(want))
  );
}

async function oneCart(
  c: SavedCart,
  products: Product[],
  cfg: Cfg,
  now: number,
  dryRun: boolean,
) {
  const who = mask(c.email);
  if (c.reminderCount >= 1) {
    const last = c.lastReminderAt ? Date.parse(c.lastReminderAt) : 0;
    if (now - last < cfg.cart.secondAfterMin * 60_000)
      return { who, result: "waiting for the second reminder" };
  }
  if (await hasPaidOrderSince(c.userId, c.updatedAt)) {
    if (!dryRun) await clearSavedCart(c.userId);
    return { who, result: "already bought" };
  }
  if (cfg.cart.requirePurchase && !(await hasPriorPurchase(c.userId)))
    return {
      who,
      result: "skipped: no purchase history (CART_REMINDER_REQUIRE_PURCHASE)",
    };

  const items = c.items.flatMap((l) => {
    const p = products.find((x) => x.id === l.id);
    return p && p.inStock
      ? [{ name: p.name, quantity: l.qty, price: p.price }]
      : [];
  });
  if (items.length === 0) {
    if (!dryRun) await clearSavedCart(c.userId);
    return { who, result: "nothing left in stock" };
  }
  if (dryRun)
    return { who, result: `would send reminder ${c.reminderCount + 1}` };

  const total =
    Math.round(items.reduce((n, i) => n + i.price * i.quantity, 0) * 100) / 100;
  const sent = await sendEmail({
    to: c.email,
    toName: c.name || undefined,
    ...t.cartReminderEmail({
      name: c.name,
      items,
      total,
      unsubscribeUrl: unsubscribeUrl(c.userId),
      second: c.reminderCount >= 1,
    }),
  });
  if (!sent) return { who, result: "email failed, will retry next run" };
  await recordCartReminder(c.userId, c.reminderCount + 1);
  return { who, result: `sent reminder ${c.reminderCount + 1}` };
}

async function oneBooking(
  b: { id: string; customer_email: string },
  dryRun: boolean,
) {
  const who = mask(b.customer_email || "unknown@unknown");
  if (dryRun) return { who, result: "would send appointment reminder" };
  if (!(await claimBookingReminder(b.id)))
    return { who, result: "already handled" };
  const full = await getBookingByIdAdmin(b.id);
  if (!full || !full.customerEmail) {
    await releaseBookingReminder(b.id);
    return { who, result: "no email address" };
  }
  const sent = await sendEmail({
    to: full.customerEmail,
    toName: full.customerName,
    ...t.bookingReminderEmail(full),
  });
  if (!sent) {
    await releaseBookingReminder(b.id); // try again next run
    return { who, result: "email failed, will retry next run" };
  }
  return { who, result: "sent appointment reminder" };
}

async function run(req: NextRequest) {
  if (!process.env.CRON_SECRET)
    return NextResponse.json(
      { error: "CRON_SECRET is not set" },
      { status: 500 },
    );
  if (!authorised(req))
    return new NextResponse("Unauthorized", { status: 401 });

  const cfg = reminderConfig();
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const only = cfg.onlyEmail;
  const now = Date.now();
  const out: {
    dryRun: boolean;
    bookings: unknown[];
    carts: unknown[];
    notes: string[];
  } = {
    dryRun,
    bookings: [],
    carts: [],
    notes: [],
  };

  // 1) Appointment reminders
  if (cfg.booking.enabled) {
    const due = (
      await listBookingsToRemind(
        cfg.booking.hoursBefore,
        cfg.booking.windowHours,
        cfg.booking.batch,
      )
    ).filter((b) => !only || (b.customer_email ?? "").toLowerCase() === only);
    out.bookings = await Promise.all(due.map((b) => oneBooking(b, dryRun)));
  } else out.notes.push("appointment reminders are switched off");

  // 2) Basket reminders
  if (!cfg.cart.enabled) out.notes.push("basket reminders are switched off");
  else if (inQuietHours(cfg.cart.quiet))
    out.notes.push("basket reminders paused: quiet hours");
  else {
    const maxReminders = cfg.cart.secondAfterMin > 0 ? 2 : 1;
    const due = (
      await listDueCarts({
        olderThanIso: new Date(
          now - cfg.cart.firstAfterMin * 60_000,
        ).toISOString(),
        newerThanIso: new Date(
          now - cfg.cart.maxAgeHours * 3_600_000,
        ).toISOString(),
        maxReminders,
        limit: cfg.cart.batch,
      })
    ).filter((c) => !only || c.email.toLowerCase() === only);
    if (due.length > 0) {
      const products = await getProducts();
      out.carts = await Promise.all(
        due.map((c) => oneCart(c, products, cfg, now, dryRun)),
      );
    }
  }
  return NextResponse.json(out);
}

export const GET = run;
export const POST = run;
