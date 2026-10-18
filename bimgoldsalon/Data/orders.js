import { supabase } from "../libs/supabase.js";

export async function createOrder(userId, total, form) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      postcode: form.postcode,
      notes: form.notes,
      payment_status: "pending",
      order_status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createOrderItems(orderId, cartItems) {
  const items = cartItems.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    quantity: item.qty,
    price: item.price,
  }));

  const { error } = await supabase.from("order_items").insert(items);
  if (error) throw error;
}

export async function updatePaymentStatus(orderId, status) {
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: status })
    .eq("id", orderId);

  if (error) throw error;
}

export async function getUserOrders(userId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(quantity, price, products(name))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(quantity, price, products(name))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from("orders")
    .update({ order_status: status })
    .eq("id", orderId);

  if (error) throw error;
}
export async function confirmOrderPayment(orderId, success) {
  const { data, error } = await supabase.rpc("confirm_order_payment", {
    p_order_id: orderId,
    p_success: success,
  });

  if (error) throw error;
  return data;
}
