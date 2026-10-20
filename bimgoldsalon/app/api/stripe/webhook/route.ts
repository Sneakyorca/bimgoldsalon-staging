import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { handleStripeEvent } from "@/Data/payments";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY)
    return new NextResponse("Stripe is not configured", { status: 500 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new NextResponse("Missing signature", { status: 400 });

  // The signature check needs the raw, unparsed text
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (e) {
    console.error("[stripe webhook]", event.type, e);
    // an error status makes Stripe try again later
    return new NextResponse("Handler failed", { status: 500 });
  }
  return NextResponse.json({ received: true });
}
