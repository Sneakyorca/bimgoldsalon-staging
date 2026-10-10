export type DeliveryMethodId = "same-day" | "next-day" | "pickup";

export type DeliveryOption = {
  id: DeliveryMethodId;
  label: string;
  fee: number;
  note: string;
  address?: string;
};

export const deliveryOptions: DeliveryOption[] = [
  {
    id: "same-day",
    label: "Same day delivery",
    fee: 20,
    note: "Please note: order must be placed before 2pm, Tuesday – Saturday.",
  },
  {
    id: "next-day",
    label: "Next day delivery (after dispatch)",
    fee: 15,
    note: "We only dispatch orders during days we are open, which is Tuesday - Saturday. We aim to deliver same day where possible.",
  },
  {
    id: "pickup",
    label: "Local pickup",
    fee: 0,
    note: "Please ensure you pick up your order before 4:30pm Tues-Fri. Pick-up is NOT available Sundays and Mondays.",
    address: "3 Market Walk, Huddersfield HD1 2QA, United Kingdom",
  },
];

export const DEFAULT_DELIVERY: DeliveryMethodId = "same-day";
