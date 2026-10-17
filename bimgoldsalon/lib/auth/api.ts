import "server-only";
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { listAdminServices } from "@/Data/adminServices";
import { listBlockedDates } from "@/Data/blockedDates";
import { listAllBookings, listBookingsForUser } from "@/Data/bookings";
import {
  seedUsers,
  seedBookings,
  seedOrders,
  seedWaitlist,
  seedBlockedDates,
  seedStockOverrides,
  seedProductExtras,
  seedServiceExtras,
  type Booking,
  type BookingStatus,
  type Order,
  type OrderStatus,
  type PaymentStatus,
  type Role,
  type WaitlistEntry,
  type BlockedDate,
} from "@/dummydata/accountData";
import { services as seedServices } from "@/dummydata/bookingData";
import { products as seedProducts } from "@/dummydata/productData";
import { listAdminProducts } from "@/Data/adminProducts";
import { listCustomers } from "@/Data/customers";
import { listAllOrders, listOrdersForUser } from "@/Data/orders";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  passwordChangedAt: number;
};
type StoredUser = PublicUser & { passwordHash: string; confirmed: boolean };
export type AdminProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  color: string;
  image: string;
  images: string[];
  extraInfo: Record<string, string>;
};
export type AdminService = {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMin: number;
  durationLabel: string;
  image: string;
  images: string[];
  extraInfo: Record<string, string>;
};
type Token = { userId: string; kind: "recovery" | "confirm"; exp: number };
type Store = {
  users: StoredUser[];
  bookings: Booking[];
  orders: Order[];
  waitlist: WaitlistEntry[];
  blocked: BlockedDate[];
  products: AdminProduct[];
  services: AdminService[];
  tokens: Map<string, Token>;
  attempts: Map<string, { count: number; resetAt: number }>;
};
const g = globalThis as typeof globalThis & { __bgStore?: Store };
const hash = (password: string) => {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(password, salt, 32).toString("hex")}`;
};
const check = (password: string, stored: string) => {
  const [salt, key] = stored.split(":");
  const actual = Buffer.from(key, "hex");
  const test = scryptSync(password, Buffer.from(salt, "hex"), 32);
  return actual.length === test.length && timingSafeEqual(actual, test);
};
const dummyHash = hash("not-a-real-password");
const store = (): Store =>
  (g.__bgStore ??= {
    users: seedUsers.map(({ password, ...u }) => ({
      ...u,
      passwordHash: hash(password),
      confirmed: true,
      passwordChangedAt: 0,
    })),
    bookings: structuredClone(seedBookings),
    orders: structuredClone(seedOrders),
    waitlist: structuredClone(seedWaitlist),
    blocked: structuredClone(seedBlockedDates),
    products: seedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: seedStockOverrides[p.id] ?? (p.inStock ? 10 : 0),
      color: seedProductExtras[p.id]?.color ?? "",
      image: p.image,
      images: [],
      extraInfo: seedProductExtras[p.id]?.extraInfo ?? {},
    })),
    services: seedServices.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      price: s.fromPrice,
      durationMin: s.durationMin,
      durationLabel: s.durationLabel,
      image: s.image,
      images: [],
      extraInfo: seedServiceExtras[s.id] ?? {},
    })),
    tokens: new Map(),
    attempts: new Map(),
  });
const pub = ({
  passwordHash: _hash,
  confirmed: _confirmed,
  ...user
}: StoredUser): PublicUser => user;
const norm = (v: string) => v.trim().toLowerCase();
const find = (identifier: string) =>
  store().users.find(
    (u) => norm(u.email) === norm(identifier) || u.phone === identifier,
  );
export async function getUserById(id: string) {
  const user = store().users.find((u) => u.id === id);
  return user ? pub(user) : null;
}
export type SignInResult =
  | { ok: true; user: PublicUser }
  | { ok: false; reason: "invalid" | "unconfirmed" | "locked" };
export async function verifyPassword(
  identifier: string,
  password: string,
): Promise<SignInResult> {
  const s = store();
  const key = norm(identifier);
  const attempt = s.attempts.get(key);
  if (attempt && attempt.resetAt > Date.now() && attempt.count >= 5)
    return { ok: false, reason: "locked" };
  const user = find(identifier);
  const good = check(password, user?.passwordHash ?? dummyHash) && !!user;
  if (!good) {
    const cur =
      attempt && attempt.resetAt > Date.now()
        ? attempt
        : { count: 0, resetAt: Date.now() + 900000 };
    s.attempts.set(key, { ...cur, count: cur.count + 1 });
    return { ok: false, reason: "invalid" };
  }
  s.attempts.delete(key);
  return user.confirmed
    ? { ok: true, user: pub(user) }
    : { ok: false, reason: "unconfirmed" };
}
export async function createCustomer(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const s = store();
  if (s.users.some((u) => norm(u.email) === norm(input.email)))
    return { created: false as const };
  const user = {
    id: `u-${randomUUID().slice(0, 8)}`,
    name: input.name.trim(),
    email: norm(input.email),
    phone: input.phone.trim(),
    role: "customer" as const,
    passwordHash: hash(input.password),
    confirmed: false,
    passwordChangedAt: 0,
  };
  s.users.push(user);
  const token = randomBytes(24).toString("base64url");
  s.tokens.set(token, {
    userId: user.id,
    kind: "confirm",
    exp: Date.now() + 86400000,
  });
  console.log(
    `[dummy email] confirm ${user.email}: /auth/callback?type=signup&token=${token}`,
  );
  return { created: true as const };
}
export async function confirmEmail(token: string) {
  const s = store();
  const t = s.tokens.get(token);
  if (!t || t.kind !== "confirm" || t.exp < Date.now()) return false;
  s.tokens.delete(token);
  const user = s.users.find((u) => u.id === t.userId);
  if (!user) return false;
  user.confirmed = true;
  return true;
}
export async function requestPasswordReset(email: string) {
  const user = store().users.find((u) => norm(u.email) === norm(email));
  if (!user) return;
  const token = randomBytes(24).toString("base64url");
  store().tokens.set(token, {
    userId: user.id,
    kind: "recovery",
    exp: Date.now() + 900000,
  });
  console.log(
    `[dummy email] reset ${user.email}: /auth/callback?type=recovery&token=${token}`,
  );
}
export async function consumeRecoveryToken(token: string) {
  const t = store().tokens.get(token);
  if (!t || t.kind !== "recovery" || t.exp < Date.now()) return null;
  store().tokens.delete(token);
  return t.userId;
}
export async function setPassword(id: string, password: string) {
  const user = store().users.find((u) => u.id === id);
  if (user) {
    user.passwordHash = hash(password);
    user.passwordChangedAt = Date.now();
  }
}
export async function devLatestToken(
  email: string,
  kind: "recovery" | "confirm",
) {
  if (process.env.NODE_ENV === "production") return null;
  const user = store().users.find((u) => norm(u.email) === norm(email));
  if (!user) return null;
  for (const [token, value] of store().tokens)
    if (value.userId === user.id && value.kind === kind) return token;
  return null;
}
export type BookingView = Booking & {
  serviceName: string;
  price: number;
  durationMin: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};
export type OrderView = Order & {
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};
const service = (id: string) => store().services.find((s) => s.id === id);
const bookingView = (b: Booking): BookingView => {
  const user = store().users.find((u) => u.id === b.userId);
  const item = service(b.serviceId);
  return {
    ...b,
    serviceName: item?.name ?? "Deleted service",
    price: item?.price ?? 0,
    durationMin: item?.durationMin ?? 0,
    customerName: user?.name ?? "Guest",
    customerEmail: user?.email ?? "",
    customerPhone: user?.phone ?? "",
  };
};
const orderView = (o: Order): OrderView => {
  const user = store().users.find((u) => u.id === o.userId);
  return {
    ...o,
    total: o.items.reduce((n, i) => n + i.price * i.quantity, 0),
    customerName: user?.name ?? "Guest",
    customerEmail: user?.email ?? "",
    customerPhone: user?.phone ?? "",
  };
};
export async function getBookingsForUser(id: string) {
  return listBookingsForUser(id);
}
export async function getOrdersForUser(id: string) {
  return listOrdersForUser(id);
}
export async function getAdminSnapshot() {
  const s = store();
  const [customers, bookings, orders, products, services, blocked] =
    await Promise.all([
      listCustomers(),
      listAllBookings(),
      listAllOrders(),
      listAdminProducts(),
      listAdminServices(),
      listBlockedDates(),
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
    users: customers,
    bookings,
    orders,
    customers,
    products: products.map((product) => ({
      ...product,
      inStock: product.stock > 0,
    })),
    services: services.map((serviceItem) => ({
      ...serviceItem,
      fromPrice: serviceItem.price,
    })),
    waitlist: s.waitlist.map((w) => ({
      ...w,
      serviceName: service(w.serviceId)?.name ?? "Deleted service",
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
      topServices: [] as { name: string; revenue: number }[],
      topProducts: [] as { name: string; revenue: number }[],
    },
  };
}
export async function updateBooking(
  id: string,
  patch: { status?: BookingStatus; isPaid?: boolean },
) {
  const b = store().bookings.find((x) => x.id === id);
  if (b) Object.assign(b, patch);
}
export async function saveBookingNotes(id: string, notes: string) {
  const b = store().bookings.find((x) => x.id === id);
  if (b) b.notes = notes.slice(0, 1000);
}
export async function updateOrder(
  id: string,
  patch: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus },
) {
  const o = store().orders.find((x) => x.id === id);
  if (o) Object.assign(o, patch);
}
export async function addBlockedDate(date: string, reason: string) {
  store().blocked.push({ id: `BD-${randomUUID().slice(0, 6)}`, date, reason });
}
export async function removeBlockedDate(id: string) {
  store().blocked = store().blocked.filter((x) => x.id !== id);
}
export async function removeWaitlistEntry(id: string) {
  store().waitlist = store().waitlist.filter((x) => x.id !== id);
}
export type Result = { ok: true } | { ok: false; error: string };
export type ProductInput = {
  name: string;
  category: string;
  price: number;
  stock: number;
  color: string;
  image: string;
  images: string[];
  extraInfo: Record<string, string>;
};
export type ServiceInput = {
  name: string;
  category: string;
  price: number;
  durationMin: number;
  image: string;
  images: string[];
  extraInfo: Record<string, string>;
};
export async function saveProduct(
  id: number | null,
  input: ProductInput,
): Promise<Result> {
  const s = store();
  if (id === null)
    s.products.push({
      id: Math.max(-1, ...s.products.map((p) => p.id)) + 1,
      ...input,
    });
  else {
    const p = s.products.find((x) => x.id === id);
    if (!p) return { ok: false, error: "Product not found." };
    Object.assign(p, input);
  }
  return { ok: true };
}
export async function deleteProduct(id: number): Promise<Result> {
  store().products = store().products.filter((p) => p.id !== id);
  return { ok: true };
}
export async function saveService(
  id: string | null,
  input: ServiceInput,
): Promise<Result> {
  const s = store();
  const data = { ...input, durationLabel: `${input.durationMin} min` };
  if (id === null)
    s.services.push({ id: `service-${randomUUID().slice(0, 6)}`, ...data });
  else {
    const item = s.services.find((x) => x.id === id);
    if (!item) return { ok: false, error: "Service not found." };
    Object.assign(item, data);
  }
  return { ok: true };
}
export async function deleteService(id: string): Promise<Result> {
  store().services = store().services.filter((s) => s.id !== id);
  return { ok: true };
}
export async function setProductStock(id: number, stock: number) {
  const p = store().products.find((x) => x.id === id);
  if (p) p.stock = stock;
}
export type AdminSnapshot = Awaited<ReturnType<typeof getAdminSnapshot>>;
export async function findDemoUserId(role: Role) {
  return process.env.NODE_ENV === "production"
    ? null
    : (store().users.find((u) => u.role === role)?.id ?? null);
}
