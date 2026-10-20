import { deliveryOptions, type DeliveryMethodId } from "@/lib/delivery-options";

export type DeliveryAvailability = Record<
  DeliveryMethodId,
  { available: boolean; reason?: string }
>;

/** Which delivery options can be chosen right now. Both always can today. */
export function deliveryAvailability(): DeliveryAvailability {
  return {
    "next-day": { available: true },
    pickup: { available: true },
  };
}

export const deliveryFeeFor = (id: string) =>
  deliveryOptions.find((o) => o.id === id)?.fee;
