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
    note: "UK delivery only. We dispatch orders on the days we are open, Monday – Saturday.",
  },
  {
    id: "pickup",
    label: "Local pickup",
    fee: 0,
    note: "Collect your order from the salon during opening hours: Monday – Saturday, 9:00 am – 7:30 pm. Pick-up is not available on Sundays.",
    address: "3 Market Walk, Huddersfield HD1 2QA, United Kingdom",
  },
];

export const DEFAULT_DELIVERY: DeliveryMethodId = "next-day";
