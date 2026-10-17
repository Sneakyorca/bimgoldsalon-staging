export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "payment_failed",
] as const;
export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;
export const LOW_STOCK_THRESHOLD = 5;
export const MAX_GALLERY_IMAGES = 6;
export const MAX_IMAGE_CHARS = 400_000;
