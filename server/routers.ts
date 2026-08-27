import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import * as db from "./db";
import { canAccessProtectedResource } from "./platform/access";
import { canPurchaseFromCreator, hasActiveAccount } from "./platform/access";
import { getStripeClient } from "./payments/stripe";
import { getStripePriceData } from "./payments/stripeProducts";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  access: router({
    post: publicProcedure.input(z.object({ postId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const subject = await db.getPostAccessSubject(input.postId);
      if (!subject) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Content was not found." });
      }

      const activeEntitlements = ctx.user ? await db.getCurrentEntitlements(ctx.user.id) : [];
      const now = Date.now();
      const hasActiveEntitlement = activeEntitlements.some(entitlement => {
        const isCurrent = !entitlement.validUntil || entitlement.validUntil.getTime() > now;
        const grantsThisPost = entitlement.resourceType === "post" && entitlement.resourceId === subject.post.id;
        const grantsCreatorMembership =
          entitlement.resourceType === "creator_membership" && entitlement.resourceId === subject.creator.id;
        return isCurrent && (grantsThisPost || grantsCreatorMembership);
      });

      const allowed = canAccessProtectedResource({
        viewer: ctx.user,
        ownerUserId: subject.creator.userId,
        accessType: subject.post.accessType,
        hasActiveEntitlement,
        isPublished: subject.post.publicationStatus === "published",
      });

      return {
        allowed,
        reason: allowed ? "granted" : "membership_or_purchase_required",
        accessType: subject.post.accessType,
      } as const;
    }),
    liveEvent: publicProcedure.input(z.object({ liveEventId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const subject = await db.getLiveEventAccessSubject(input.liveEventId);
      if (!subject) throw new TRPCError({ code: "NOT_FOUND", message: "Live event was not found." });
      const activeEntitlements = ctx.user ? await db.getCurrentEntitlements(ctx.user.id) : [];
      const now = Date.now();
      const hasActiveEntitlement = activeEntitlements.some(entitlement => {
        const isCurrent = !entitlement.validUntil || entitlement.validUntil.getTime() > now;
        return isCurrent && ((entitlement.resourceType === "live_event" && entitlement.resourceId === subject.event.id) || (entitlement.resourceType === "creator_membership" && entitlement.resourceId === subject.creator.id));
      });
      const allowed = canAccessProtectedResource({
        viewer: ctx.user,
        ownerUserId: subject.creator.userId,
        accessType: subject.event.accessType === "ticketed" ? "ticketed" : subject.event.accessType,
        hasActiveEntitlement,
        isPublished: subject.event.status === "scheduled" || subject.event.status === "live" || subject.event.status === "ended",
      });
      return { allowed, reason: allowed ? "granted" : "membership_or_ticket_required", accessType: subject.event.accessType } as const;
    }),
  }),

  checkout: router({
    create: protectedProcedure.input(z.object({ productId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      if (!hasActiveAccount(ctx.user)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Your account is not eligible to purchase access." });
      }
      const product = await db.getActiveProduct(input.productId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "This offer is no longer available." });
      const creator = await db.getCreatorProfileById(product.creatorId);
      if (!creator || !canPurchaseFromCreator(ctx.user, creator.userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This purchase is not permitted." });
      }

      const originHeader = ctx.req.headers.origin;
      const origin = typeof originHeader === "string" && /^https?:\/\//.test(originHeader) ? originHeader : "http://localhost:3000";
      const mode = product.productType === "subscription" ? "subscription" : "payment";
      const session = await getStripeClient().checkout.sessions.create({
        mode,
        line_items: [{ price_data: getStripePriceData(product), quantity: 1 }],
        customer_email: ctx.user.email ?? undefined,
        client_reference_id: String(ctx.user.id),
        metadata: {
          user_id: String(ctx.user.id),
          creator_id: String(product.creatorId),
          product_id: String(product.id),
        },
        allow_promotion_codes: true,
        success_url: `${origin}/dashboard?checkout=success`,
        cancel_url: `${origin}/creator/${creator.handle}?checkout=canceled`,
      });
      if (!session.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Checkout could not be created." });
      await db.createPendingOrder({ buyerId: ctx.user.id, productId: product.id, provider: "stripe", providerCheckoutId: session.id });
      await db.logAuditEvent({ actorId: ctx.user.id, action: "payment.checkout_created", targetType: "product", targetId: String(product.id), metadata: { checkoutId: session.id } });
      return { url: session.url };
    }),
  }),

  safety: router({
    report: publicProcedure.input(z.object({
      subjectType: z.enum(["profile", "post", "asset", "message", "live_event", "ad"]),
      subjectId: z.number().int().positive(),
      reason: z.string().trim().min(3).max(120),
      detail: z.string().trim().max(5000).optional(),
    })).mutation(async ({ ctx, input }) => db.createReport({ ...input, reporterId: ctx.user?.id ?? null })),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
