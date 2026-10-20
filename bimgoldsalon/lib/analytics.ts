export const RANGES = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
  { id: "12m", label: "12 months", days: 365 },
] as const;
export type RangeId = (typeof RANGES)[number]["id"];

export type Analytics = {
  range: RangeId;
  kpis: {
    revenue: number;
    productRevenue: number;
    depositRevenue: number;
    orders: number;
    bookings: number;
    avgOrder: number;
    cancelledBookings: number;
  };
  series: { label: string; products: number; deposits: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  topServices: { name: string; bookings: number; value: number }[];
  weekdays: { label: string; count: number }[];
};
