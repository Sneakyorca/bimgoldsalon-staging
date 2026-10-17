"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as productData from "@/Data/adminProducts";
import * as serviceData from "@/Data/adminServices";
import * as blockedData from "@/Data/blockedDates";
import * as bookingData from "@/Data/bookings";
import * as orderData from "@/Data/orders";
import {
  BOOKING_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@/dummydata/accountData";
import { productInputSchema } from "@/lib/admin/product-schema";
import { serviceInputSchema } from "@/lib/admin/service-schema";
import * as api from "@/lib/auth/api";
import { getCurrentUser, requireAdmin } from "@/lib/auth/dal";
import { isISODate } from "@/lib/booking";
import type { ProductInput } from "@/lib/products";
import { DEFAULT_DEPOSIT_PERCENT, type ServiceInput } from "@/lib/services";

type Result = { ok: true } | { ok: false; error: string };
const firstIssue = (error: z.ZodError) =>
  error.issues[0]?.message ?? "Check the details and try again.";
const throwIfFailed = (r: Result) => {
  if (!r.ok) throw new Error(r.error);
};

const dummyId = z.string().min(1).max(80);
const uuid = z.string().uuid();
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

// ---- Bookings (real database) ---------------------------------------------

export async function setBookingStatus(bookingId: string, status: string) {
  await requireAdmin();
  const p = z
    .object({ id: uuid, status: z.enum(BOOKING_STATUSES) })
    .parse({ id: bookingId, status });
  throwIfFailed(await bookingData.setBookingStatusRecord(p.id, p.status));
  refreshBooking();
}
export async function setBookingPaid(bookingId: string, paid: boolean) {
  await requireAdmin();
  const p = z
    .object({ id: uuid, paid: z.boolean() })
    .parse({ id: bookingId, paid });
  throwIfFailed(await bookingData.setBookingPaidRecord(p.id, p.paid));
  refreshBooking();
}
export async function setBookingNotes(bookingId: string, notes: string) {
  await requireAdmin();
  const p = z
    .object({ id: uuid, notes: z.string().max(1000) })
    .parse({ id: bookingId, notes });
  throwIfFailed(await bookingData.setBookingNotesRecord(p.id, p.notes));
  refreshBooking();
}

// ---- Blocked dates (real database) ------------------------------------------

// Inside an action, requireAdmin() ends in a redirect or a 404 page when the
// sign-in has expired, and the browser calls that an "unexpected response".
// For these two we check quietly and answer with a message instead.
const SESSION_EXPIRED =
  "Your sign-in has expired. Please refresh the page and sign in again.";
const isAdminUser = async () => (await getCurrentUser())?.role === "admin";

export async function blockDate(date: string, reason: string): Promise<Result> {
  try {
    if (!(await isAdminUser())) return { ok: false, error: SESSION_EXPIRED };
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
  } catch (e) {
    console.error("[blockDate]", e);
    return { ok: false, error: "Could not block that date. Please try again." };
  }
}

export async function unblockDate(blockId: string): Promise<Result> {
  try {
    if (!(await isAdminUser())) return { ok: false, error: SESSION_EXPIRED };
    const p = z
      .string()
      .regex(/^\d{1,12}$/)
      .safeParse(blockId);
    if (!p.success) return { ok: false, error: "Invalid date." };
    const res = await blockedData.removeBlockedDateRecord(Number(p.data));
    if (res.ok) refreshBooking();
    return res;
  } catch (e) {
    console.error("[unblockDate]", e);
    return {
      ok: false,
      error: "Could not reopen that date. Please try again.",
    };
  }
}

// ---- Orders and waitlist (still dummy data) -------------------------------------

export async function setOrderStatus(
  orderId: string,
  status: string,
): Promise<Result> {
  await requireAdmin();
  const p = z
    .object({
      id: z.string().regex(/^\d{1,12}$/),
      status: z.enum(ORDER_STATUSES),
    })
    .safeParse({ id: orderId, status });
  if (!p.success) return { ok: false, error: "Invalid order." };
  const res = await orderData.setOrderStatusRecord(
    Number(p.data.id),
    p.data.status,
  );
  if (res.ok) {
    refreshShop(); // cancelling puts stock back
    revalidatePath("/account");
  }
  return res;
}
export async function setOrderPayment(
  orderId: string,
  status: string,
): Promise<Result> {
  await requireAdmin();
  const p = z
    .object({
      id: z.string().regex(/^\d{1,12}$/),
      status: z.enum(PAYMENT_STATUSES),
    })
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
}
export async function removeWaitlist(entryId: string) {
  await requireAdmin();
  await api.removeWaitlistEntry(dummyId.parse(entryId));
  done();
}

// ---- Products (real database) ---------------------------------------------------

export async function createProduct(input: {
  name: string;
  category: string;
  price: number;
  stock: number;
}): Promise<Result> {
  await requireAdmin();
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
}

export async function removeProduct(productId: number): Promise<Result> {
  await requireAdmin();
  const parsed = z.number().int().min(0).safeParse(productId);
  if (!parsed.success) return { ok: false, error: "Invalid product." };
  const result = await productData.deleteProductRecord(parsed.data);
  if (result.ok) refreshShop();
  return result;
}

export async function updateStock(
  productId: number,
  stock: number,
): Promise<Result> {
  await requireAdmin();
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
}

export async function saveProduct(
  productId: number | null,
  input: ProductInput,
): Promise<Result> {
  await requireAdmin();
  const idCheck = z.number().int().min(0).nullable().safeParse(productId);
  if (!idCheck.success) return { ok: false, error: "Invalid product." };
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const result = await productData.saveProductRecord(idCheck.data, parsed.data);
  if (result.ok) refreshShop();
  return result;
}

// ---- Services (real database) ----------------------------------------------------

export async function createService(input: {
  name: string;
  category: string;
  durationMin: number;
  fromPrice: number;
}): Promise<Result> {
  await requireAdmin();
  const parsed = serviceInputSchema.safeParse({
    name: input.name,
    category: input.category,
    price: input.fromPrice,
    durationMin: input.durationMin,
    durationLabel: "",
    depositPercent: DEFAULT_DEPOSIT_PERCENT,
    featured: false,
    capacity: 1,
    image: "",
    images: [],
    extraInfo: {},
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const result = await serviceData.saveServiceRecord(null, parsed.data);
  if (result.ok) refreshBooking();
  return result;
}

export async function removeService(serviceId: number): Promise<Result> {
  await requireAdmin();
  const parsed = z.number().int().min(0).safeParse(serviceId);
  if (!parsed.success) return { ok: false, error: "Invalid service." };
  const result = await serviceData.deleteServiceRecord(parsed.data);
  if (result.ok) refreshBooking();
  return result;
}

export async function saveService(
  serviceId: number | null,
  input: ServiceInput,
): Promise<Result> {
  await requireAdmin();
  const idCheck = z.number().int().min(0).nullable().safeParse(serviceId);
  if (!idCheck.success) return { ok: false, error: "Invalid service." };
  const parsed = serviceInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const result = await serviceData.saveServiceRecord(idCheck.data, parsed.data);
  if (result.ok) refreshBooking();
  return result;
}
