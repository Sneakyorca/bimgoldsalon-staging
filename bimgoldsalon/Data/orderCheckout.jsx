import { getCurrentUser } from "./auth.js";
import {
  createOrder,
  createOrderItems,
  confirmOrderPayment,
} from "./orders.js";
import { supabase } from "../libs/supabase";

export async function submitOrderPayment({ total, form, cartItems }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please login first.");

  const order = await createOrder(user.id, total, form);
  await createOrderItems(order.id, cartItems); // stock decrements via DB trigger here

  const { data, error } = await supabase.functions.invoke(
    "create-checkout-session",
    {
      body: { type: "order", id: order.id, origin: window.location.origin },
    },
  );

  if (error || !data?.url) {
    await confirmOrderPayment(order.id, false);
    throw new Error(
      error?.message || "Could not start checkout. Please try again.",
    );
  }

  window.location.href = data.url;
}
