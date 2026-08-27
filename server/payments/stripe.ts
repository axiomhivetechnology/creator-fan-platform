import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Payment provider is not configured. Add the provider keys in the project payment settings.");
  }

  if (!stripeClient) stripeClient = new Stripe(key);
  return stripeClient;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}
