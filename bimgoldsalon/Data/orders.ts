import "server-only";
import type { OrderStatus, PaymentStatus } from "@/dummydata/accountData";
import type { OrderView } from "@/lib/auth/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });

const SELECT =
  "id, user_id, order_status, payment_status, delivery_method, delivery_fee, subtotal, total, customer_name, customer_email, customer_phone, country, street, city, county, postcode, notes, created_at, order_items(product_id, name, price, quantity)";

type Row = {
  id: number;
  user_id: string | null;
  order_status: string;
  payment_status: string;
  delivery_method: string;
  delivery_fee: number | string;
  subtotal: number | string;
  total: number | string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  country: string;
  street: string;
  city: string;
  county: string;
  postcode: string;
  notes: string;
  created_at: string;
  order_items:
    | {
        product_id: number | null;
        name: string;
        price: number | string;
        quantity: number;
      }[]
    | null;
};

// Same shape the dashboard and admin already use
const toView = (r: Row): OrderView => ({
  id: String(r.id),
  userId: r.user_id ?? "",
  createdAt: r.created_at,
  items: (r.order_items ?? []).map((i, idx) => ({
    productId: i.product_id ?? -(idx + 1),
    name: i.name,
    quantity: i.quantity,
    price: Number(i.price),
  })),
  orderStatus: r.order_status as OrderStatus,
  paymentStatus: r.payment_status as PaymentStatus,
  address: r.street,
  city: r.city,
  state: r.county,
  postcode: r.postcode,
  notes: r.notes,
  country: r.country,
  deliveryMethod: r.delivery_method,
  deliveryFee: Number(r.delivery_fee),
  subtotal: Number(r.subtotal),
  total: Number(r.total),
  customerName: r.customer_name,
  customerEmail: r.customer_email,
  customerPhone: r.customer_phone,
});

export async function listOrdersForUser(userId: string): Promise<OrderView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("Could not load your orders.");
  return (data as unknown as Row[]).map(toView);
}

export async function getOrderForUser(
  userId: string,
  orderId: string,
): Promise<OrderView | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT)
    .eq("id", Number(orderId))
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Could not load the order.");
  return data ? toView(data as unknown as Row) : null;
}

/** Admin only (row-level security returns nothing for anyone else) */
export async function listAllOrders(): Promise<OrderView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error("Could not load orders.");
  return (data as unknown as Row[]).map(toView);
}

export type CreateOrderResult =
  | { ok: true; id: number }
  | { ok: false; error: string; code?: "stock" };

export async function createOrderRecord(input: {
  userId: string;
  items: { id: number; qty: number }[];
  deliveryMethod: string;
  deliveryFee: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  street: string;
  city: string;
  county: string;
  postcode: string;
  notes: string;
}): Promise<CreateOrderResult> {
  // Server-only function in the database, so it uses the admin client
  const { data, error } = await createAdminClient().rpc("create_order", {
    p_user_id: input.userId,
    p_items: input.items,
    p_delivery_method: input.deliveryMethod,
    p_delivery_fee: input.deliveryFee,
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_country: input.country,
    p_street: input.street,
    p_city: input.city,
    p_county: input.county,
    p_postcode: input.postcode,
    p_notes: input.notes,
  });

  if (error) {
    if (error.message.includes("out_of_stock"))
      return {
        ok: false,
        code: "stock",
        error: `Sorry, "${error.details ?? "an item"}" doesn't have enough stock for the quantity you chose. Please update your cart.`,
      };
    if (error.message.includes("invalid_items"))
      return {
        ok: false,
        code: "stock",
        error:
          "One of the items in your cart is no longer available. Please check your cart.",
      };
    if (error.message.includes("too_many_pending"))
      return {
        ok: false,
        error:
          "You already have several orders waiting for payment. Please wait until the salon has processed them.",
      };
    console.error("[createOrderRecord]", error.code, error.message);
    return {
      ok: false,
      error: "We couldn't place your order. Please try again.",
    };
  }
  return { ok: true, id: data as number };
}

export async function setOrderStatusRecord(
  id: number,
  status: string,
): Promise<Result> {
  const { error } = await createAdminClient().rpc("admin_set_order_status", {
    p_order_id: id,
    p_status: status,
  });
  if (error) {
    if (error.message.includes("cannot_uncancel"))
      return fail(
        "A cancelled order can't be reopened. Ask the customer to place a new order.",
      );
    console.error("[setOrderStatusRecord]", error.code, error.message);
    return fail("Could not update the order.");
  }
  return { ok: true };
}

export async function setOrderPaymentRecord(
  id: number,
  status: string,
): Promise<Result> {
  const { error } = await createAdminClient()
    .from("orders")
    .update({ payment_status: status })
    .eq("id", id);
  if (error) {
    console.error("[setOrderPaymentRecord]", error.code, error.message);
    return fail("Could not update the payment status.");
  }
  return { ok: true };
}
