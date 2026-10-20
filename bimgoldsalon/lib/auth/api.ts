import "server-only";
import { listAdminProducts } from "@/Data/adminProducts";
import { listAdminServices } from "@/Data/adminServices";
import { listApplications } from "@/Data/applications";
import { listBlockedDates } from "@/Data/blockedDates";
import { listAllBookings, listBookingsForUser } from "@/Data/bookings";
import { listCustomers } from "@/Data/customers";
import { listAllOrders, listOrdersForUser } from "@/Data/orders";
import { getSettings } from "@/Data/settings";
import { listWaitlist } from "@/Data/waitlist";
import type {
  BookingStatus,
  OrderStatus,
  PaymentStatus,
  Role,
} from "@/lib/statuses";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
};

export type BookingView = {
  id: string;
  userId: string;
  serviceId: string;
  date: string;
  /** "HH:MM" */
  time: string;
  status: BookingStatus;
  isPaid: boolean;
  depositAmount: number;
  notes: string;
  serviceName: string;
  price: number;
  durationMin: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export type OrderItem = {
  productId: number;
  name: string;
  quantity: number;
  price: number;
};

export type OrderView = {
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
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export async function getBookingsForUser(id: string) {
  return listBookingsForUser(id);
}

export async function getOrdersForUser(id: string) {
  return listOrdersForUser(id);
}

export async function getAdminSnapshot() {
  const [
    customers,
    bookings,
    orders,
    products,
    services,
    blocked,
    applications,
    waitlist,
    settings,
  ] = await Promise.all([
    listCustomers(),
    listAllBookings(),
    listAllOrders(),
    listAdminProducts(),
    listAdminServices(),
    listBlockedDates(),
    listApplications(),
    listWaitlist(),
    getSettings(),
  ]);

  const paidOrders = orders.filter(
    (o) => o.paymentStatus === "paid" && o.orderStatus !== "cancelled",
  );
  const paidBookings = bookings.filter(
    (b) => b.isPaid && b.status !== "cancelled",
  );
  const revenue =
    paidOrders.reduce((n, o) => n + o.total, 0) +
    paidBookings.reduce((n, b) => n + b.depositAmount, 0);
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "pending",
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  return {
    bookings,
    orders,
    customers,
    applications,
    waitlist,
    settings,
    products: products.map((product) => ({
      ...product,
      inStock: product.stock > 0,
    })),
    services: services.map((serviceItem) => ({
      ...serviceItem,
      fromPrice: serviceItem.price,
    })),
    blocked,
    blockedDates: blocked,
    stats: {
      pending: pendingBookings + pendingOrders,
      revenue,
      paidBookings: paidBookings.length,
      paidOrders: paidOrders.length,
      pendingBookings,
      pendingOrders,
    },
  };
}

export type AdminSnapshot = Awaited<ReturnType<typeof getAdminSnapshot>>;
