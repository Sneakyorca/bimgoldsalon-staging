import "server-only";
import Stripe from "stripe";

let client: Stripe | undefined;

/** True once STRIPE_SECRET_KEY is set. Without it the shop still takes orders, just without online payment. */
export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(key, { appInfo: { name: "bimgold-salon" } });
  return client;
}
