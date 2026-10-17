import { fromISODate, salonToday } from "@/lib/booking";
import {
  deliveryOptions,
  type DeliveryMethodId,
} from "@/dummydata/deliveryData";

export type DeliveryAvailability = Record<
  DeliveryMethodId,
  { available: boolean; reason?: string }
>;

/**
 * Which delivery options can be chosen right now, on the salon's clock.
 * Used by the checkout page and checked again on the server.
 */
export function deliveryAvailability(now = new Date()): DeliveryAvailability {
  const today = salonToday(now);
  const weekday = fromISODate(today.date).getDay(); // 0 = Sunday
  const openDay = weekday >= 2 && weekday <= 6; // Tuesday to Saturday
  const beforeCutoff = today.minutes < 14 * 60; // 2pm

  return {
    "same-day":
      openDay && beforeCutoff
        ? { available: true }
        : {
            available: false,
            reason:
              "Same day delivery is only available for orders placed before 2pm, Tuesday to Saturday.",
          },
    "next-day": { available: true },
    pickup: { available: true },
  };
}

export const deliveryFeeFor = (id: string) =>
  deliveryOptions.find((o) => o.id === id)?.fee;
