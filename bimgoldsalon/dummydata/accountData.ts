export type Role = "admin" | "customer";
export {
  BOOKING_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  LOW_STOCK_THRESHOLD,
} from "@/lib/admin/constants";
import {
  BOOKING_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@/lib/admin/constants";
export type SeedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
};
export const seedUsers: SeedUser[] = [
  {
    id: "u-admin",
    name: "Bimpe Adeyemi",
    email: "admin@demo.com",
    phone: "07700 900001",
    role: "admin",
    password: "Admin123!",
  },
  {
    id: "u-1",
    name: "Amara Okafor",
    email: "customer@demo.com",
    phone: "07700 900002",
    role: "customer",
    password: "Customer123!",
  },
  {
    id: "u-2",
    name: "Tolu Bakare",
    email: "tolu@example.com",
    phone: "07700 900003",
    role: "customer",
    password: "Customer123!",
  },
];
const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");
export const daysFromNow = (n: number) => {
  const d = new Date(Date.now() + n * DAY);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const isoDaysFromNow = (n: number) =>
  new Date(Date.now() + n * DAY).toISOString();
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type Booking = {
  id: string;
  userId: string;
  serviceId: string;
  date: string;
  time: string;
  status: BookingStatus;
  isPaid: boolean;
  depositAmount: number;
  notes: string;
};
export const seedBookings: Booking[] = [
  {
    id: "BK-1001",
    userId: "u-1",
    serviceId: "silk-press",
    date: daysFromNow(3),
    time: "10:00",
    status: "confirmed",
    isPaid: true,
    depositAmount: 15,
    notes: "Prefers heat protectant.",
  },
  {
    id: "BK-1002",
    userId: "u-1",
    serviceId: "deep-conditioning",
    date: daysFromNow(-12),
    time: "14:30",
    status: "completed",
    isPaid: true,
    depositAmount: 25,
    notes: "",
  },
];
export type OrderItem = {
  productId: number;
  name: string;
  quantity: number;
  price: number;
};
export type Order = {
  id: string;
  userId: string;
  createdAt: string;
  items: OrderItem[];
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  address: string;
  city: string;
  state: string;
  postcode: string;
  notes: string;
  country?: string;
  deliveryMethod?: string;
  deliveryFee?: number;
  subtotal?: number;
};
export const seedOrders: Order[] = [
  {
    id: "OR-2001",
    userId: "u-1",
    createdAt: isoDaysFromNow(-2),
    items: [{ productId: 1, name: "Lace Front Wig", quantity: 1, price: 100 }],
    orderStatus: "processing",
    paymentStatus: "paid",
    address: "12 Station Road",
    city: "Huddersfield",
    state: "West Yorkshire",
    postcode: "HD1 1AA",
    notes: "",
  },
];
export type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceId: string;
  preferredDate: string | null;
};
export const seedWaitlist: WaitlistEntry[] = [];
export type BlockedDate = { id: string; date: string; reason: string };
export const seedBlockedDates: BlockedDate[] = [];
export const seedStockOverrides: Record<number, number> = { 1: 3, 5: 0 };
export const seedProductExtras: Record<
  number,
  { color: string; extraInfo: Record<string, string> }
> = {};
export const seedServiceExtras: Record<string, Record<string, string>> = {};
