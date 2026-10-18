export type DeliveryMethodId = "next-day" | "pickup";

export type DeliveryOption = {
  id: DeliveryMethodId;
  label: string;
  fee: number;
  note: string;
  address?: string;
};

export const deliveryOptions: DeliveryOption[] = [
  {
    id: "next-day",
    label: "Next day delivery (after dispatch)",
    fee: 15,
    note: "UK delivery only. We only dispatch orders on the days we are open, Tuesday – Saturday.",
  },
  {
    id: "pickup",
    label: "Local pickup",
    fee: 0,
    note: "Please ensure you pick up your order before 4:30pm Tues-Fri. Pick-up is NOT available Sundays and Mondays.",
    address: "3 Market Walk, Huddersfield HD1 2QA, United Kingdom",
  },
];

export const DEFAULT_DELIVERY: DeliveryMethodId = "next-day";
