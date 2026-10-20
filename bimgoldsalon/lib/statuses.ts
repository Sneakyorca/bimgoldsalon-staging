import {
  BOOKING_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@/lib/admin/constants";

export { BOOKING_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES };

export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type Role = "admin" | "customer";

export const APPLICATION_STATUSES = [
  "new",
  "contacted",
  "accepted",
  "declined",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
