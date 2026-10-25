"use server";

import { revalidatePath } from "next/cache";
import { getAnalytics } from "@/Data/analytics";
import * as settingsData from "@/Data/settings";
import * as waitlistData from "@/Data/waitlist";
import { notifyWaitlistEntry } from "@/lib/email/notify";
import { settingsSchema, type SettingsInput } from "@/lib/schemas/settings";
import type { Analytics } from "@/lib/analytics";
import { z } from "zod";
import * as applicationData from "@/Data/applications";
import * as productData from "@/Data/adminProducts";
import * as serviceData from "@/Data/adminServices";
import * as blockedData from "@/Data/blockedDates";
import * as bookingData from "@/Data/bookings";
import * as orderData from "@/Data/orders";
import { productInputSchema } from "@/lib/admin/product-schema";
import { serviceInputSchema } from "@/lib/admin/service-schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { isISODate } from "@/lib/booking";
import type { ProductInput } from "@/lib/products";
import {
  DEFAULT_DEPOSIT_PERCENT,
  DEFAULT_SERVICE_CAPACITY,
  type ServiceInput,
} from "@/lib/services";
import {
  APPLICATION_STATUSES,
  BOOKING_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@/lib/statuses";
import { notifyBookingStatus, notifyOrderStatus } from "@/lib/email/notify";
import * as promoData from "@/Data/promo";
import { promoSchema, type PromoInput } from "@/lib/schemas/promo";

type Result = { ok: true } | { ok: false; error: string };

const firstIssue = (error: z.ZodError) =>
  error.issues[0]?.message ?? "Check the details and try again.";

const SESSION_EXPIRED: Result = {
  ok: false,
  error: "Your sign-in has expired. Please refresh the page and sign in again.",
};

// Inside an action, redirect()/notFound() turn into an opaque "unexpected
// response" in the browser. These check quietly and answer with a message.
const isAdminUser = async () => (await getCurrentUser())?.role === "admin";

/** Runs an admin action that returns a result: sign-in check plus a safety net */
async function guarded(task: () => Promise<Result>): Promise<Result> {
  try {
    if (!(await isAdminUser())) return SESSION_EXPIRED;
    return await task();
  } catch (e) {
    console.error("[admin action]", e);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

/** For actions that return nothing: the panel catches the error and shows a message */
async function assertAdmin() {
  if (!(await isAdminUser())) throw new Error("Not signed in as an admin.");
}
const throwIfFailed = (r: Result) => {
  if (!r.ok) throw new Error(r.error);
};

const uuid = z.string().uuid();
const numericId = z.string().regex(/^\d{1,12}$/);

const done = () => revalidatePath("/admin");
const refreshShop = () => {
  revalidatePath("/admin");
  revalidatePath("/product", "layout");
  revalidatePath("/");
};
const refreshBooking = () => {
  revalidatePath("/admin");
  revalidatePath("/booking", "layout");
  revalidatePath("/account");
  revalidatePath("/");
};

// ---- Bookings --------------------------------------------------------------

export async function setBookingStatus(bookingId: string, status: string) {
  await assertAdmin();
  const p = z
    .object({ id: uuid, status: z.enum(BOOKING_STATUSES) })
    .parse({ id: bookingId, status });
  const before = await bookingData.getBookingStatusRecord(p.id);
  throwIfFailed(await bookingData.setBookingStatusRecord(p.id, p.status));
  refreshBooking();
  // only email when the status actually changed
  if (before !== p.status) notifyBookingStatus(p.id, p.status);
}

export async function setBookingPaid(bookingId: string, paid: boolean) {
  await assertAdmin();
  const p = z
    .object({ id: uuid, paid: z.boolean() })
    .parse({ id: bookingId, paid });
  throwIfFailed(await bookingData.setBookingPaidRecord(p.id, p.paid));
  refreshBooking();
}

export async function setBookingNotes(bookingId: string, notes: string) {
  await assertAdmin();
  const p = z
    .object({ id: uuid, notes: z.string().max(1000) })
    .parse({ id: bookingId, notes });
  throwIfFailed(await bookingData.setBookingNotesRecord(p.id, p.notes));
  refreshBooking();
}

// ---- Blocked dates -----------------------------------------------------------

export async function blockDate(date: string, reason: string): Promise<Result> {
  return guarded(async () => {
    const p = z
      .object({
        date: z.string().refine(isISODate, "That isn't a real date."),
        reason: z.string().trim().max(120, "Reason is too long."),
      })
      .safeParse({ date, reason });
    if (!p.success) return { ok: false, error: firstIssue(p.error) };
    const res = await blockedData.addBlockedDateRecord(
      p.data.date,
      p.data.reason,
    );
    if (res.ok) refreshBooking();
    return res;
  });
}

export async function unblockDate(blockId: string): Promise<Result> {
  return guarded(async () => {
    const p = numericId.safeParse(blockId);
    if (!p.success) return { ok: false, error: "Invalid date." };
    const res = await blockedData.removeBlockedDateRecord(Number(p.data));
    if (res.ok) refreshBooking();
    return res;
  });
}

// ---- Orders -------------------------------------------------------------------
export async function setOrderStatus(
  orderId: string,
  status: string,
): Promise<Result> {
  return guarded(async () => {
    const p = z
      .object({ id: numericId, status: z.enum(ORDER_STATUSES) })
      .safeParse({ id: orderId, status });
    if (!p.success) return { ok: false, error: "Invalid order." };
    const id = Number(p.data.id);
    const before = await orderData.getOrderStatusRecord(id);
    const res = await orderData.setOrderStatusRecord(id, p.data.status);
    if (res.ok) {
      refreshShop(); // cancelling puts stock back
      revalidatePath("/account");
      if (before !== p.data.status) notifyOrderStatus(id, p.data.status);
    }
    return res;
  });
}

export async function setOrderPayment(
  orderId: string,
  status: string,
): Promise<Result> {
  return guarded(async () => {
    const p = z
      .object({ id: numericId, status: z.enum(PAYMENT_STATUSES) })
      .safeParse({ id: orderId, status });
    if (!p.success) return { ok: false, error: "Invalid order." };
    const res = await orderData.setOrderPaymentRecord(
      Number(p.data.id),
      p.data.status,
    );
    if (res.ok) {
      done();
      revalidatePath("/account");
    }
    return res;
  });
}

// ---- Products ------------------------------------------------------------------

export async function createProduct(input: {
  name: string;
  category: string;
  price: number;
  stock: number;
}): Promise<Result> {
  return guarded(async () => {
    const parsed = productInputSchema.safeParse({
      ...input,
      discountPercent: 0,
      description: "",
      color: "",
      image: "",
      images: [],
      extraInfo: {},
    });
    if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
    const result = await productData.saveProductRecord(null, parsed.data);
    if (result.ok) refreshShop();
    return result;
  });
}

export async function removeProduct(productId: number): Promise<Result> {
  return guarded(async () => {
    const parsed = z.number().int().min(0).safeParse(productId);
    if (!parsed.success) return { ok: false, error: "Invalid product." };
    const result = await productData.deleteProductRecord(parsed.data);
    if (result.ok) refreshShop();
    return result;
  });
}

export async function updateStock(
  productId: number,
  stock: number,
): Promise<Result> {
  return guarded(async () => {
    const parsed = z
      .object({
        id: z.number().int().min(0),
        stock: z.number().int().min(0).max(100000),
      })
      .safeParse({ id: productId, stock });
    if (!parsed.success)
      return { ok: false, error: "Stock must be a whole number, 0 or more." };
    const result = await productData.setProductStockRecord(
      parsed.data.id,
      parsed.data.stock,
    );
    if (result.ok) refreshShop();
    return result;
  });
}

export async function saveProduct(
  productId: number | null,
  input: ProductInput,
): Promise<Result> {
  return guarded(async () => {
    const idCheck = z.number().int().min(0).nullable().safeParse(productId);
    if (!idCheck.success) return { ok: false, error: "Invalid product." };
    const parsed = productInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
    const result = await productData.saveProductRecord(
      idCheck.data,
      parsed.data,
    );
    if (result.ok) refreshShop();
    return result;
  });
}

// ---- Services ---------------------------------------------------------------------

export async function createService(input: {
  name: string;
  category: string;
  durationMin: number;
  fromPrice: number;
}): Promise<Result> {
  return guarded(async () => {
    const parsed = serviceInputSchema.safeParse({
      name: input.name,
      category: input.category,
      price: input.fromPrice,
      priceIsFrom: false,
      durationMin: input.durationMin,
      durationLabel: "",
      depositPercent: DEFAULT_DEPOSIT_PERCENT,
      featured: false,
      capacity: DEFAULT_SERVICE_CAPACITY,
      image: "",
      images: [],
      extraInfo: {},
    });
    if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
    const result = await serviceData.saveServiceRecord(null, parsed.data);
    if (result.ok) refreshBooking();
    return result;
  });
}

export async function removeService(serviceId: number): Promise<Result> {
  return guarded(async () => {
    const parsed = z.number().int().min(0).safeParse(serviceId);
    if (!parsed.success) return { ok: false, error: "Invalid service." };
    const result = await serviceData.deleteServiceRecord(parsed.data);
    if (result.ok) refreshBooking();
    return result;
  });
}

export async function saveService(
  serviceId: number | null,
  input: ServiceInput,
): Promise<Result> {
  return guarded(async () => {
    const idCheck = z.number().int().min(0).nullable().safeParse(serviceId);
    if (!idCheck.success) return { ok: false, error: "Invalid service." };
    const parsed = serviceInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
    const result = await serviceData.saveServiceRecord(
      idCheck.data,
      parsed.data,
    );
    if (result.ok) refreshBooking();
    return result;
  });
}
// ---- Training applications ---------------------------------------------------------

export async function setApplicationStatus(
  applicationId: string,
  status: string,
): Promise<Result> {
  return guarded(async () => {
    const p = z
      .object({ id: uuid, status: z.enum(APPLICATION_STATUSES) })
      .safeParse({ id: applicationId, status });
    if (!p.success) return { ok: false, error: "Invalid application." };
    const res = await applicationData.setApplicationStatusRecord(
      p.data.id,
      p.data.status,
    );
    if (res.ok) done();
    return res;
  });
}

export async function setApplicationNotes(
  applicationId: string,
  notes: string,
): Promise<Result> {
  return guarded(async () => {
    const p = z
      .object({ id: uuid, notes: z.string().max(1000) })
      .safeParse({ id: applicationId, notes });
    if (!p.success) return { ok: false, error: "Notes are too long." };
    const res = await applicationData.setApplicationNotesRecord(
      p.data.id,
      p.data.notes,
    );
    if (res.ok) done();
    return res;
  });
}

export async function removeApplication(
  applicationId: string,
): Promise<Result> {
  return guarded(async () => {
    const p = uuid.safeParse(applicationId);
    if (!p.success) return { ok: false, error: "Invalid application." };
    const res = await applicationData.deleteApplicationRecord(p.data);
    if (res.ok) done();
    return res;
  });
}
// ---- Settings -----------------------------------------------------------------------

export async function saveSettings(input: SettingsInput): Promise<Result> {
  return guarded(async () => {
    const p = settingsSchema.safeParse(input);
    if (!p.success) return { ok: false, error: firstIssue(p.error) };
    const res = await settingsData.saveSettingsRecord(p.data);
    if (res.ok) {
      refreshBooking();
      revalidatePath("/", "layout"); // the footer and About page show the hours
    }
    return res;
  });
}

// ---- Analytics ----------------------------------------------------------------------

export async function getAnalyticsAction(
  range: string,
): Promise<{ ok: true; data: Analytics } | { ok: false; error: string }> {
  try {
    if (!(await isAdminUser()))
      return {
        ok: false,
        error:
          "Your sign-in has expired. Please refresh the page and sign in again.",
      };
    const p = z.enum(["7d", "30d", "90d", "12m"]).safeParse(range);
    if (!p.success) return { ok: false, error: "Invalid range." };
    return { ok: true, data: await getAnalytics(p.data) };
  } catch (e) {
    console.error("[getAnalyticsAction]", e);
    return {
      ok: false,
      error: "Could not load the numbers. Please try again.",
    };
  }
}

// ---- Waitlist -----------------------------------------------------------------------

export async function sendWaitlistNotice(entryId: string): Promise<Result> {
  return guarded(async () => {
    const p = uuid.safeParse(entryId);
    if (!p.success) return { ok: false, error: "Invalid entry." };
    notifyWaitlistEntry(p.data);
    done();
    return { ok: true };
  });
}

export async function removeWaitlistEntry(entryId: string): Promise<Result> {
  return guarded(async () => {
    const p = uuid.safeParse(entryId);
    if (!p.success) return { ok: false, error: "Invalid entry." };
    const res = await waitlistData.deleteWaitlistRecord(p.data);
    if (res.ok) done();
    return res;
  });
}
// ---- Promotion pop-up ---------------------------------------------------------------

export async function savePromo(input: PromoInput): Promise<Result> {
  return guarded(async () => {
    const p = promoSchema.safeParse(input);
    if (!p.success) return { ok: false, error: firstIssue(p.error) };
    const res = await promoData.savePromoRecord(p.data);
    if (res.ok) {
      done();
      revalidatePath("/", "layout"); // every page can show it
    }
    return res;
  });
}
