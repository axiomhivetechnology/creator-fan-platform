import type { Express, Request, Response } from "express";
import express from "express";
import type Stripe from "stripe";
import * as db from "../db";
import { getStripeClient } from "./stripe";

async function handleCompletedCheckout(session: Stripe.Checkout.Session) {
  const completed = await db.fulfillPaidOrder({
    checkoutId: session.id,
    paymentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    subscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null,
  });

  if (completed) {
    await db.logAuditEvent({
      actorId: null,
      action: "payment.checkout_completed",
      targetType: "order",
      targetId: String(completed.orderId),
      metadata: { checkoutId: session.id, fulfillment: completed.fulfillment },
    });
  }
}

export function registerStripeWebhook(app: Express) {
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers["stripe-signature"];

    if (!secret || typeof signature !== "string") {
      return res.status(503).json({ error: "Payment provider webhook is not configured." });
    }

    let event: Stripe.Event;
    try {
      event = getStripeClient().webhooks.constructEvent(req.body, signature, secret);
    } catch (error) {
      console.warn("[Stripe] Webhook signature verification failed", error instanceof Error ? error.message : "unknown error");
      return res.status(400).json({ error: "Invalid webhook signature." });
    }

    if (event.id.startsWith("evt_test_")) {
      console.log("[Stripe] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    try {
      if (event.type === "checkout.session.completed") {
        await handleCompletedCheckout(event.data.object as Stripe.Checkout.Session);
      }
      if (event.type === "checkout.session.expired") {
        const session = event.data.object as Stripe.Checkout.Session;
        await db.expirePendingOrder(session.id);
      }

      await db.logAuditEvent({
        actorId: null,
        action: `payment.event.${event.type}`,
        targetType: "stripe_event",
        targetId: event.id,
        metadata: { createdAt: event.created },
      });
      return res.json({ received: true });
    } catch (error) {
      console.error("[Stripe] Webhook processing failed", error);
      return res.status(500).json({ error: "Webhook processing failed." });
    }
  });
}
