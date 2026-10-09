import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import * as db from "./db";
import { canAccessProtectedResource, canAdministerPlatform, canEnterPremiumNetwork, canModeratePlatform } from "./platform/access";
import { canPurchaseFromCreator, hasActiveAccount } from "./platform/access";
import { canSubmitCreatorApplication } from "./platform/creatorApplication";
import { isAcceptedMediaSize, isAcceptedMediaType, safeMediaFilename } from "./platform/media";
import { canOpenConversation, isConversationParticipant } from "./platform/messaging";
import { makePremiumAccessDecision } from "./platform/premium";
import { calculateTransactionEconomics, monetizationCatalog } from "./platform/monetization";
import { canCreatePrivateWorkspace, canSendTokenGift } from "./platform/collaboration";
import { getStripeClient } from "./payments/stripe";
import { getStripePriceData } from "./payments/stripeProducts";
import { storageCreateUploadTarget } from "./storage";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { siteSettingsInputSchema } from "@shared/siteSettings";
import { canViewNotification, notificationInputSchema } from "@shared/notifications";

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

  premium: router({
    plans: publicProcedure.query(async () => db.listActivePremiumAccessPlans()),
    status: protectedProcedure.query(async ({ ctx }) => {
      const status = await db.getPremiumAccessStatus(ctx.user.id);
      return {
        ...makePremiumAccessDecision(status),
        subscription: await db.getCurrentPlatformSubscription(ctx.user.id),
      };
    }),
  }),

  monetization: router({
    catalog: publicProcedure.query(() => ({
      platformFeePolicy: "0.00",
      settlementNote: "Gross transaction value remains in the ecosystem less baseline merchant processing; provider fees, refunds, reserves, taxes, payouts, and disputes are reconciled separately.",
      verticals: monetizationCatalog,
    })),
    quote: protectedProcedure.input(z.object({
      grossAmount: z.number().positive().max(999999.99),
      currency: z.string().regex(/^[A-Za-z]{3}$/).optional(),
      vertical: z.enum(["platform_membership", "creator_subscription", "paid_content", "live_gifting", "b2b_workspace"]),
    })).query(async ({ ctx, input }) => {
      if (!hasActiveAccount(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "An active account is required for a transaction quote." });
      const premiumStatus = await db.getPremiumAccessStatus(ctx.user.id);
      if (input.vertical !== "platform_membership" && !canEnterPremiumNetwork(ctx.user, premiumStatus)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "An active Premium Access membership is required for this monetization vertical." });
      }
      return {
        premiumRequired: false,
        ...calculateTransactionEconomics(input),
      };
    }),
  }),

  tokens: router({
    giftEligibility: protectedProcedure.input(z.object({ creatorId: z.number().int().positive(), amount: z.number().int().positive().max(1000000) })).query(async ({ ctx, input }) => {
      const premiumStatus = await db.getPremiumAccessStatus(ctx.user.id);
      const creator = await db.getCreatorProfileById(input.creatorId);
      const allowed = Boolean(creator && canSendTokenGift({
        user: ctx.user,
        premiumStatus,
        creatorApproved: creator.approvalStatus === "approved",
        creatorAllowsTips: creator.allowTips,
        amount: input.amount,
      }));
      return { allowed, reason: allowed ? "eligible" : "premium_creator_or_tip_policy_required" } as const;
    }),
  }),

  workspaces: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const premiumStatus = await db.getPremiumAccessStatus(ctx.user.id);
      if (!canCreatePrivateWorkspace(ctx.user, premiumStatus) && ctx.user.role !== "fan") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Premium Access and an approved workspace role are required." });
      }
      if (!canEnterPremiumNetwork(ctx.user, premiumStatus)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Premium Access is required to view private workspaces." });
      }
      return db.listEngineeringWorkspacesForUser(ctx.user.id);
    }),
    create: protectedProcedure.input(z.object({ slug: z.string().trim().regex(/^[a-z0-9-]{3,96}$/), name: z.string().trim().min(2).max(160), description: z.string().trim().max(2000).optional() })).mutation(async ({ ctx, input }) => {
      const premiumStatus = await db.getPremiumAccessStatus(ctx.user.id);
      if (!canCreatePrivateWorkspace(ctx.user, premiumStatus)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Premium Access and an approved creator or administrator role are required to create a private workspace." });
      }
      const workspace = await db.createEngineeringWorkspace({ ...input, ownerId: ctx.user.id });
      await db.logAuditEvent({ actorId: ctx.user.id, action: "workspace.created", targetType: "engineering_workspace", targetId: String(workspace.id), metadata: { slug: workspace.slug, requiresMfa: true } });
      return workspace;
    }),
  }),

  siteSettings: router({
    current: publicProcedure.query(() => db.getSiteSettings()),
    update: adminProcedure.input(siteSettingsInputSchema).mutation(async ({ ctx, input }) => {
      const settings = await db.upsertSiteSettings(input, ctx.user.id);
      await db.logAuditEvent({
        actorId: ctx.user.id,
        action: "developer.site_settings_updated",
        targetType: "site_settings",
        targetId: "1",
        metadata: { changedFields: Object.keys(input), editor: "developer" },
      });
      return settings;
    }),
  }),

  notifications: router({
    current: publicProcedure.query(async ({ ctx }) => {
      const notifications = await db.getActiveSiteNotifications();
      return notifications.filter(notification => canViewNotification(notification.audience, ctx.user?.role));
    }),
    adminList: adminProcedure.query(() => db.listSiteNotifications()),
    create: adminProcedure.input(notificationInputSchema).mutation(async ({ ctx, input }) => {
      const notification = await db.createSiteNotification(input, ctx.user.id);
      await db.logAuditEvent({ actorId: ctx.user.id, action: "developer.notification_created", targetType: "site_notification", targetId: String(notification.id), metadata: { severity: input.severity, audience: input.audience } });
      return notification;
    }),
    setActive: adminProcedure.input(z.object({ id: z.number().int().positive(), isActive: z.boolean() })).mutation(async ({ ctx, input }) => {
      const notification = await db.setSiteNotificationActive(input.id, input.isActive);
      if (!notification) throw new TRPCError({ code: "NOT_FOUND", message: "Notification not found." });
      await db.logAuditEvent({ actorId: ctx.user.id, action: "developer.notification_status_changed", targetType: "site_notification", targetId: String(input.id), metadata: { isActive: input.isActive } });
      return notification;
    }),
  }),

  creatorApplication: router({
    me: protectedProcedure.query(async ({ ctx }) => (await db.getCreatorApplicationForUser(ctx.user.id)) ?? null),
    submit: protectedProcedure.input(z.object({
      displayName: z.string().trim().min(2).max(120),
      proposedHandle: z.string().trim().regex(/^[a-z0-9-]{3,64}$/),
      category: z.string().trim().max(80).optional(),
      applicationNote: z.string().trim().max(2000).optional(),
      agreementAccepted: z.literal(true),
    })).mutation(async ({ ctx, input }) => {
      if (!canSubmitCreatorApplication(ctx.user)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Your account is not eligible to submit a creator application." });
      }
      const application = await db.submitCreatorApplication({
        ...input,
        userId: ctx.user.id,
        agreementVersion: "creator-agreement-pending-legal-review",
      });
      await db.logAuditEvent({
        actorId: ctx.user.id,
        action: "creator.application_submitted",
        targetType: "creator_application",
        targetId: String(application.id),
        metadata: { status: application.status },
      });
      return application;
    }),
  }),

  creator: router({
    publishingStatus: protectedProcedure.query(async ({ ctx }) => {
      const creator = await db.getCreatorPublishingProfile(ctx.user.id);
      if (!creator) return { enabled: false, reason: "application_required" as const, creator: null };
      const enabled = creator.approvalStatus === "approved" && creator.payoutStatus === "ready";
      return { enabled, reason: enabled ? "ready" as const : "verification_or_payout_required" as const, creator };
    }),
    createPost: protectedProcedure.input(z.object({
      title: z.string().trim().min(1).max(180),
      body: z.string().trim().max(10000).optional(),
      accessType: z.enum(["public", "members", "ppv", "private"]),
      ppvPrice: z.number().min(0.5).max(999999.99).optional(),
    }).superRefine((input, context) => {
      if (input.accessType === "ppv" && input.ppvPrice === undefined) context.addIssue({ code: "custom", path: ["ppvPrice"], message: "A paid drop requires an unlock price." });
      if (input.accessType !== "ppv" && input.ppvPrice !== undefined) context.addIssue({ code: "custom", path: ["ppvPrice"], message: "An unlock price is only supported for paid drops." });
    })).mutation(async ({ ctx, input }) => {
      const creator = await db.getCreatorPublishingProfile(ctx.user.id);
      if (!creator || creator.approvalStatus !== "approved" || creator.payoutStatus !== "ready") throw new TRPCError({ code: "FORBIDDEN", message: "Creator verification and payout readiness are required before drafting content." });
      const post = await db.createCreatorPost({ ...input, creatorId: creator.id, ppvPrice: input.ppvPrice?.toFixed(2) });
      await db.logAuditEvent({ actorId: ctx.user.id, action: "creator.post_drafted", targetType: "post", targetId: String(post.id), metadata: { accessType: input.accessType } });
      return post;
    }),
    createMediaUploadTarget: protectedProcedure.input(z.object({ postId: z.number().int().positive(), filename: z.string().trim().min(1).max(180), contentType: z.string().trim().max(160), byteSize: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      if (!isAcceptedMediaType(input.contentType) || !isAcceptedMediaSize(input.byteSize)) throw new TRPCError({ code: "BAD_REQUEST", message: "This media type or file size is not permitted." });
      const owned = await db.getCreatorOwnedPost(input.postId, ctx.user.id);
      if (!owned || owned.creator.approvalStatus !== "approved" || owned.creator.payoutStatus !== "ready") throw new TRPCError({ code: "FORBIDDEN", message: "You cannot upload media for this post." });
      return storageCreateUploadTarget(`creator/${owned.creator.id}/posts/${owned.post.id}/${safeMediaFilename(input.filename)}`, input.contentType);
    }),
    registerMedia: protectedProcedure.input(z.object({ postId: z.number().int().positive(), storageKey: z.string().trim().min(1).max(512), contentType: z.string().trim().max(160), byteSize: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      if (!isAcceptedMediaType(input.contentType) || !isAcceptedMediaSize(input.byteSize)) throw new TRPCError({ code: "BAD_REQUEST", message: "This media type or file size is not permitted." });
      const owned = await db.getCreatorOwnedPost(input.postId, ctx.user.id);
      if (!owned || !input.storageKey.startsWith(`creator/${owned.creator.id}/posts/${owned.post.id}/`)) throw new TRPCError({ code: "FORBIDDEN", message: "You cannot register this media asset." });
      const asset = await db.registerCreatorContentAsset({ ...input, creatorId: owned.creator.id });
      await db.logAuditEvent({ actorId: ctx.user.id, action: "creator.media_registered", targetType: "content_asset", targetId: String(asset.id), metadata: { postId: input.postId, moderationStatus: asset.moderationStatus } });
      return asset;
    }),
    createLiveEvent: protectedProcedure.input(z.object({
      title: z.string().trim().min(1).max(180),
      description: z.string().trim().max(5000).optional(),
      accessType: z.enum(["members", "ticketed", "private"]),
      scheduledStartAt: z.coerce.date(),
      scheduledEndAt: z.coerce.date().optional(),
    }).superRefine((input, context) => {
      if (input.scheduledStartAt.getTime() <= Date.now()) context.addIssue({ code: "custom", path: ["scheduledStartAt"], message: "Schedule a live event in the future." });
      if (input.scheduledEndAt && input.scheduledEndAt <= input.scheduledStartAt) context.addIssue({ code: "custom", path: ["scheduledEndAt"], message: "Event end time must follow the start time." });
    })).mutation(async ({ ctx, input }) => {
      const creator = await db.getCreatorPublishingProfile(ctx.user.id);
      if (!creator || creator.approvalStatus !== "approved" || creator.payoutStatus !== "ready") throw new TRPCError({ code: "FORBIDDEN", message: "Creator verification and payout readiness are required to schedule a live event." });
      const event = await db.createCreatorLiveEvent({ ...input, creatorId: creator.id });
      await db.logAuditEvent({ actorId: ctx.user.id, action: "creator.live_event_scheduled", targetType: "live_event", targetId: String(event.id), metadata: { accessType: input.accessType, startsAt: input.scheduledStartAt.toISOString() } });
      return event;
    }),
    updateContactSettings: protectedProcedure.input(z.object({ messagePolicy: z.enum(["premium_members", "creator_members", "disabled"]), allowTips: z.boolean() })).mutation(async ({ ctx, input }) => {
      const creator = await db.getCreatorPublishingProfile(ctx.user.id);
      if (!creator || creator.approvalStatus !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "An approved creator profile is required to change contact settings." });
      const updated = await db.updateCreatorContactSettings(ctx.user.id, input);
      await db.logAuditEvent({ actorId: ctx.user.id, action: "creator.contact_settings_updated", targetType: "creator_profile", targetId: String(creator.id), metadata: input });
      return updated;
    }),
  }),

  member: router({
    followCreator: protectedProcedure.input(z.object({ creatorId: z.number().int().positive(), following: z.boolean() })).mutation(async ({ ctx, input }) => {
      const premiumStatus = await db.getPremiumAccessStatus(ctx.user.id);
      if (!canEnterPremiumNetwork(ctx.user, premiumStatus)) throw new TRPCError({ code: "FORBIDDEN", message: "Premium Access is required to follow creators." });
      const creator = await db.getCreatorProfileById(input.creatorId);
      if (!creator || creator.approvalStatus !== "approved") throw new TRPCError({ code: "NOT_FOUND", message: "This creator is unavailable." });
      const result = await db.setCreatorFollow(ctx.user.id, creator.id, input.following);
      await db.logAuditEvent({ actorId: ctx.user.id, action: input.following ? "member.creator_followed" : "member.creator_unfollowed", targetType: "creator_profile", targetId: String(creator.id) });
      return result;
    }),
    blockAccount: protectedProcedure.input(z.object({ userId: z.number().int().positive(), reason: z.string().trim().max(300).optional() })).mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot block your own account." });
      const result = await db.setAccountBlock(ctx.user.id, input.userId, input.reason);
      await db.logAuditEvent({ actorId: ctx.user.id, action: "safety.account_blocked", targetType: "user", targetId: String(input.userId) });
      return result;
    }),
    unblockAccount: protectedProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const result = await db.removeAccountBlock(ctx.user.id, input.userId);
      await db.logAuditEvent({ actorId: ctx.user.id, action: "safety.account_unblocked", targetType: "user", targetId: String(input.userId) });
      return result;
    }),
  }),

  messaging: router({
    open: protectedProcedure.input(z.object({ creatorId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const premiumStatus = await db.getPremiumAccessStatus(ctx.user.id);
      if (!canEnterPremiumNetwork(ctx.user, premiumStatus)) throw new TRPCError({ code: "FORBIDDEN", message: "Premium Access is required to contact creators." });
      const creator = await db.getCreatorProfileById(input.creatorId);
      if (!creator) throw new TRPCError({ code: "NOT_FOUND", message: "This creator is unavailable." });
      const allowed = canOpenConversation({ hasPremiumAccess: true, hasCreatorMembership: await db.hasCurrentCreatorMembership(ctx.user.id, creator.id), isBlocked: await db.isBlockedBetween(ctx.user.id, creator.userId), policy: creator.messagePolicy });
      if (!allowed) throw new TRPCError({ code: "FORBIDDEN", message: "This creator’s current contact settings do not allow a new conversation." });
      const conversation = await db.getOrCreateConversation(ctx.user.id, creator.id);
      return { id: conversation.id };
    }),
    send: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), body: z.string().trim().min(1).max(5000) })).mutation(async ({ ctx, input }) => {
      const subject = await db.getConversationForParticipant(input.conversationId, ctx.user.id);
      if (!subject || subject.conversation.status !== "open" || !isConversationParticipant({ userId: ctx.user.id, fanId: subject.conversation.fanId, creatorUserId: subject.creator.userId })) throw new TRPCError({ code: "FORBIDDEN", message: "You cannot send a message in this conversation." });
      const otherUserId = ctx.user.id === subject.conversation.fanId ? subject.creator.userId : subject.conversation.fanId;
      if (await db.isBlockedBetween(ctx.user.id, otherUserId)) throw new TRPCError({ code: "FORBIDDEN", message: "This conversation is unavailable." });
      const message = await db.sendConversationMessage(input.conversationId, ctx.user.id, input.body);
      await db.logAuditEvent({ actorId: ctx.user.id, action: "member.message_sent", targetType: "conversation", targetId: String(input.conversationId), metadata: { messageId: message.id } });
      return message;
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const premiumStatus = await db.getPremiumAccessStatus(ctx.user.id);
      if (!canEnterPremiumNetwork(ctx.user, premiumStatus)) throw new TRPCError({ code: "FORBIDDEN", message: "Premium Access is required to view conversations." });
      return db.listConversationsForUser(ctx.user.id);
    }),
    history: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const subject = await db.getConversationForParticipant(input.conversationId, ctx.user.id);
      if (!subject) throw new TRPCError({ code: "FORBIDDEN", message: "You cannot view this conversation." });
      return db.listConversationMessages(input.conversationId);
    }),
  }),

  operations: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      if (!canModeratePlatform(ctx.user) && !canAdministerPlatform(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Staff operations access is required." });
      return db.getOperationsSummary();
    }),
    creatorApplications: protectedProcedure.query(async ({ ctx }) => {
      if (!canAdministerPlatform(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
      return db.listSubmittedCreatorApplications();
    }),
    reviewCreatorApplication: protectedProcedure.input(z.object({ applicationId: z.number().int().positive(), status: z.enum(["needs_info", "approved", "rejected", "restricted"]), eligibilityStatus: z.enum(["pending", "verified", "failed", "expired"]), payoutReadiness: z.enum(["pending", "ready", "restricted"]), reviewNote: z.string().trim().max(2000).optional() })).mutation(async ({ ctx, input }) => {
      if (!canAdministerPlatform(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
      const result = await db.reviewCreatorApplication({ ...input, reviewerId: ctx.user.id });
      await db.logAuditEvent({ actorId: ctx.user.id, action: "operations.creator_application_reviewed", targetType: "creator_application", targetId: String(input.applicationId), metadata: input });
      return result;
    }),
    reports: protectedProcedure.query(async ({ ctx }) => {
      if (!canModeratePlatform(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Moderation authority is required." });
      return db.listOpenReports();
    }),
    resolveReport: protectedProcedure.input(z.object({ reportId: z.number().int().positive(), status: z.enum(["under_review", "actioned", "dismissed"]) })).mutation(async ({ ctx, input }) => {
      if (!canModeratePlatform(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Moderation authority is required." });
      const result = await db.resolveReport(input);
      await db.logAuditEvent({ actorId: ctx.user.id, action: "operations.report_updated", targetType: "report", targetId: String(input.reportId), metadata: input });
      return result;
    }),
    pendingAssets: protectedProcedure.query(async ({ ctx }) => {
      if (!canModeratePlatform(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Moderation authority is required." });
      return db.listPendingContentAssets();
    }),
    reviewAsset: protectedProcedure.input(z.object({ assetId: z.number().int().positive(), status: z.enum(["approved", "rejected"]) })).mutation(async ({ ctx, input }) => {
      if (!canModeratePlatform(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Moderation authority is required." });
      const result = await db.reviewContentAsset(input.assetId, input.status);
      await db.logAuditEvent({ actorId: ctx.user.id, action: "operations.asset_reviewed", targetType: "content_asset", targetId: String(input.assetId), metadata: input });
      return result;
    }),
    pendingAds: protectedProcedure.query(async ({ ctx }) => {
      if (!canAdministerPlatform(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
      return db.listPendingAdPlacements();
    }),
    reviewAd: protectedProcedure.input(z.object({ adId: z.number().int().positive(), status: z.enum(["approved", "paused", "rejected"]) })).mutation(async ({ ctx, input }) => {
      if (!canAdministerPlatform(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
      const result = await db.reviewAdPlacement(input.adId, input.status);
      await db.logAuditEvent({ actorId: ctx.user.id, action: "operations.ad_reviewed", targetType: "ad_placement", targetId: String(input.adId), metadata: input });
      return result;
    }),
  }),

  access: router({
    post: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const premiumStatus = await db.getPremiumAccessStatus(ctx.user.id);
      if (!canEnterPremiumNetwork(ctx.user, premiumStatus)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "An active Premium Access membership is required to enter the creator network." });
      }
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
    liveEvent: protectedProcedure.input(z.object({ liveEventId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const premiumStatus = await db.getPremiumAccessStatus(ctx.user.id);
      if (!canEnterPremiumNetwork(ctx.user, premiumStatus)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "An active Premium Access membership is required to enter the creator network." });
      }
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
      const premiumStatus = await db.getPremiumAccessStatus(ctx.user.id);
      if (!canEnterPremiumNetwork(ctx.user, premiumStatus)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "An active Premium Access membership is required before purchasing creator offers." });
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
