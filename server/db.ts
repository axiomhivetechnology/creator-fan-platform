import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  accountBlocks,
  adPlacements,
  auditLogs,
  creatorApplications,
  creatorFollows,
  creatorProfiles,
  contentAssets,
  conversations,
  entitlements,
  InsertUser,
  orders,
  posts,
  products,
  reports,
  siteNotifications,
  siteSettings,
  liveEvents,
  messages,
  platformAccessPlans,
  platformSubscriptions,
  subscriptions,
  tokenAccounts,
  engineeringWorkspaces,
  engineeringWorkspaceMembers,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import type { PremiumAccessStatus } from "./platform/access";
import { defaultSiteSettings, toPublicSiteSettings, type SiteSettingsInput } from "@shared/siteSettings";
import type { NotificationInput } from "@shared/notifications";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCreatorApplicationForUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [application] = await db.select().from(creatorApplications).where(eq(creatorApplications.userId, userId)).limit(1);
  return application;
}

export async function submitCreatorApplication(input: {
  userId: number;
  displayName: string;
  proposedHandle: string;
  category?: string;
  applicationNote?: string;
  agreementVersion: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const existing = await getCreatorApplicationForUser(input.userId);
  if (existing?.status === "approved") throw new Error("This creator application is already approved.");
  const values = {
    displayName: input.displayName,
    proposedHandle: input.proposedHandle,
    category: input.category ?? null,
    applicationNote: input.applicationNote ?? null,
    agreementVersion: input.agreementVersion,
    agreementAcceptedAt: new Date(),
    status: "submitted" as const,
    submittedAt: new Date(),
  };
  if (existing) {
    await db.update(creatorApplications).set(values).where(eq(creatorApplications.id, existing.id));
    return { id: existing.id, status: "submitted" as const };
  }
  const result = await db.insert(creatorApplications).values({ userId: input.userId, ...values });
  return { id: result[0].insertId, status: "submitted" as const };
}

export async function getCreatorPublishingProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [creator] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1);
  return creator;
}

export async function createCreatorPost(input: { creatorId: number; title: string; body?: string; accessType: "public" | "members" | "ppv" | "private"; ppvPrice?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const result = await db.insert(posts).values({ creatorId: input.creatorId, title: input.title, body: input.body ?? null, accessType: input.accessType, ppvPrice: input.ppvPrice ?? null, publicationStatus: "draft" });
  return { id: result[0].insertId, publicationStatus: "draft" as const };
}

export async function getCreatorOwnedPost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) return undefined;
  const creator = await getCreatorProfileById(post.creatorId);
  if (!creator || creator.userId !== userId) return undefined;
  return { post, creator };
}

export async function registerCreatorContentAsset(input: { creatorId: number; postId: number; storageKey: string; contentType: string; byteSize: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const result = await db.insert(contentAssets).values({ creatorId: input.creatorId, postId: input.postId, storageKey: input.storageKey, contentType: input.contentType, byteSize: input.byteSize, moderationStatus: "pending" });
  return { id: result[0].insertId, moderationStatus: "pending" as const };
}

export async function getPostAccessSubject(postId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) return undefined;

  const [creator] = await db
    .select()
    .from(creatorProfiles)
    .where(eq(creatorProfiles.id, post.creatorId))
    .limit(1);

  if (!creator) return undefined;
  return { post, creator };
}

export async function getCurrentEntitlements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(entitlements)
    .where(and(eq(entitlements.userId, userId), eq(entitlements.status, "active")));
}

export async function hasCurrentCreatorMembership(userId: number, creatorId: number) {
  const entitlementsForUser = await getCurrentEntitlements(userId);
  const now = Date.now();
  return entitlementsForUser.some(entitlement => entitlement.resourceType === "creator_membership" && entitlement.resourceId === creatorId && (!entitlement.validUntil || entitlement.validUntil.getTime() > now));
}

export async function isBlockedBetween(userId: number, otherUserId: number) {
  const db = await getDb();
  if (!db) return false;
  const [block] = await db.select({ id: accountBlocks.id }).from(accountBlocks).where(or(and(eq(accountBlocks.blockerUserId, userId), eq(accountBlocks.blockedUserId, otherUserId)), and(eq(accountBlocks.blockerUserId, otherUserId), eq(accountBlocks.blockedUserId, userId)))).limit(1);
  return Boolean(block);
}

export async function setCreatorFollow(fanId: number, creatorId: number, following: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  if (!following) {
    await db.delete(creatorFollows).where(and(eq(creatorFollows.fanId, fanId), eq(creatorFollows.creatorId, creatorId)));
    return { following: false };
  }
  await db.insert(creatorFollows).values({ fanId, creatorId }).onDuplicateKeyUpdate({ set: { fanId } });
  return { following: true };
}

export async function setAccountBlock(blockerUserId: number, blockedUserId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(accountBlocks).values({ blockerUserId, blockedUserId, reason: reason ?? null }).onDuplicateKeyUpdate({ set: { reason: reason ?? null } });
  return { blocked: true };
}

export async function removeAccountBlock(blockerUserId: number, blockedUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.delete(accountBlocks).where(and(eq(accountBlocks.blockerUserId, blockerUserId), eq(accountBlocks.blockedUserId, blockedUserId)));
  return { blocked: false };
}

export async function updateCreatorContactSettings(userId: number, input: { messagePolicy: "premium_members" | "creator_members" | "disabled"; allowTips: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const creator = await getCreatorPublishingProfile(userId);
  if (!creator) throw new Error("Creator profile was not found.");
  await db.update(creatorProfiles).set(input).where(eq(creatorProfiles.id, creator.id));
  return { ...creator, ...input };
}

export async function getOrCreateConversation(fanId: number, creatorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const [existing] = await db.select().from(conversations).where(and(eq(conversations.fanId, fanId), eq(conversations.creatorId, creatorId))).limit(1);
  if (existing) return existing;
  const result = await db.insert(conversations).values({ fanId, creatorId, status: "open" });
  const [created] = await db.select().from(conversations).where(eq(conversations.id, result[0].insertId)).limit(1);
  if (!created) throw new Error("Conversation could not be created.");
  return created;
}

export async function getConversationForParticipant(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  if (!conversation) return undefined;
  const creator = await getCreatorProfileById(conversation.creatorId);
  if (!creator || (conversation.fanId !== userId && creator.userId !== userId)) return undefined;
  return { conversation, creator };
}

export async function sendConversationMessage(conversationId: number, senderId: number, body: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const result = await db.insert(messages).values({ conversationId, senderId, body, status: "sent" });
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId));
  return { id: result[0].insertId };
}

export async function listConversationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: conversations.id,
      fanId: conversations.fanId,
      creatorId: conversations.creatorId,
      status: conversations.status,
      updatedAt: conversations.updatedAt,
      creatorDisplayName: creatorProfiles.displayName,
      creatorHandle: creatorProfiles.handle,
      creatorUserId: creatorProfiles.userId,
    })
    .from(conversations)
    .innerJoin(creatorProfiles, eq(creatorProfiles.id, conversations.creatorId))
    .where(or(eq(conversations.fanId, userId), eq(creatorProfiles.userId, userId)))
    .orderBy(desc(conversations.updatedAt));
  return rows;
}

export async function listConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(asc(messages.createdAt));
}

export async function getOperationsSummary() {
  const db = await getDb();
  if (!db) return { creatorApplications: 0, openReports: 0, pendingAssets: 0, pendingAds: 0 };
  const [applications, openReports, pendingAssets, pendingAds] = await Promise.all([
    db.select({ id: creatorApplications.id }).from(creatorApplications).where(eq(creatorApplications.status, "submitted")),
    db.select({ id: reports.id }).from(reports).where(eq(reports.status, "open")),
    db.select({ id: contentAssets.id }).from(contentAssets).where(eq(contentAssets.moderationStatus, "pending")),
    db.select({ id: adPlacements.id }).from(adPlacements).where(eq(adPlacements.status, "pending_review")),
  ]);
  return { creatorApplications: applications.length, openReports: openReports.length, pendingAssets: pendingAssets.length, pendingAds: pendingAds.length };
}

export async function listSubmittedCreatorApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creatorApplications).where(eq(creatorApplications.status, "submitted")).orderBy(asc(creatorApplications.submittedAt));
}

export async function reviewCreatorApplication(input: { applicationId: number; reviewerId: number; status: "needs_info" | "approved" | "rejected" | "restricted"; eligibilityStatus: "pending" | "verified" | "failed" | "expired"; payoutReadiness: "pending" | "ready" | "restricted"; reviewNote?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const [application] = await db.select().from(creatorApplications).where(eq(creatorApplications.id, input.applicationId)).limit(1);
  if (!application) throw new Error("Creator application was not found.");
  await db.update(creatorApplications).set({ status: input.status, eligibilityStatus: input.eligibilityStatus, payoutReadiness: input.payoutReadiness, reviewNote: input.reviewNote ?? null, reviewedBy: input.reviewerId, reviewedAt: new Date() }).where(eq(creatorApplications.id, application.id));
  if (input.status === "approved" && input.eligibilityStatus === "verified" && input.payoutReadiness === "ready") {
    await db.update(users).set({ role: "creator" }).where(eq(users.id, application.userId));
    const creator = await getCreatorPublishingProfile(application.userId);
    if (creator) {
      await db.update(creatorProfiles).set({ displayName: application.displayName, handle: application.proposedHandle, category: application.category, approvalStatus: "approved", payoutStatus: "ready" }).where(eq(creatorProfiles.id, creator.id));
    } else {
      await db.insert(creatorProfiles).values({ userId: application.userId, displayName: application.displayName, handle: application.proposedHandle, category: application.category, approvalStatus: "approved", payoutStatus: "ready" });
    }
  }
  return { id: application.id, status: input.status };
}

export async function listOpenReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).where(or(eq(reports.status, "open"), eq(reports.status, "under_review"))).orderBy(asc(reports.createdAt));
}

export async function resolveReport(input: { reportId: number; status: "under_review" | "actioned" | "dismissed" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.update(reports).set({ status: input.status, resolvedAt: input.status === "under_review" ? null : new Date() }).where(eq(reports.id, input.reportId));
  return { id: input.reportId, status: input.status };
}

export async function listPendingContentAssets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentAssets).where(eq(contentAssets.moderationStatus, "pending")).orderBy(asc(contentAssets.createdAt));
}

export async function reviewContentAsset(assetId: number, status: "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.update(contentAssets).set({ moderationStatus: status }).where(eq(contentAssets.id, assetId));
  return { id: assetId, status };
}

export async function listPendingAdPlacements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adPlacements).where(eq(adPlacements.status, "pending_review")).orderBy(asc(adPlacements.createdAt));
}

export async function reviewAdPlacement(adId: number, status: "approved" | "paused" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.update(adPlacements).set({ status }).where(eq(adPlacements.id, adId));
  return { id: adId, status };
}

export async function getPremiumAccessStatus(userId: number): Promise<PremiumAccessStatus> {
  const db = await getDb();
  if (!db) return "none";
  const rows = await db
    .select()
    .from(entitlements)
    .where(and(eq(entitlements.userId, userId), eq(entitlements.resourceType, "premium_access")))
    .orderBy(desc(entitlements.updatedAt));
  const now = Date.now();
  const current = rows.find(row => !row.validUntil || row.validUntil.getTime() > now);
  if (!current) return rows[0]?.status === "revoked" ? "revoked" : rows[0]?.status === "expired" ? "expired" : "none";
  return current.status === "active" || current.status === "grace" || current.status === "revoked" || current.status === "expired"
    ? current.status
    : "none";
}

export async function listActivePremiumAccessPlans() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: platformAccessPlans.id,
      code: platformAccessPlans.code,
      name: platformAccessPlans.name,
      description: platformAccessPlans.description,
      monthlyPrice: platformAccessPlans.monthlyPrice,
      annualPrice: platformAccessPlans.annualPrice,
      currency: platformAccessPlans.currency,
      policyVersion: platformAccessPlans.policyVersion,
    })
    .from(platformAccessPlans)
    .where(eq(platformAccessPlans.status, "active"))
    .orderBy(asc(platformAccessPlans.sortOrder));
}

export async function getCurrentPlatformSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [subscription] = await db
    .select()
    .from(platformSubscriptions)
    .where(eq(platformSubscriptions.userId, userId))
    .orderBy(desc(platformSubscriptions.updatedAt))
    .limit(1);
  return subscription;
}

export async function createEngineeringWorkspace(input: { ownerId: number; slug: string; name: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const result = await db.insert(engineeringWorkspaces).values({
    ownerId: input.ownerId,
    slug: input.slug,
    name: input.name,
    description: input.description ?? null,
    status: "active",
    requiresMfa: true,
  });
  const workspaceId = result[0].insertId;
  await db.insert(engineeringWorkspaceMembers).values({ workspaceId, userId: input.ownerId, role: "owner", status: "active" });
  return { id: workspaceId, slug: input.slug, status: "active" as const };
}

export async function listEngineeringWorkspacesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: engineeringWorkspaces.id,
      slug: engineeringWorkspaces.slug,
      name: engineeringWorkspaces.name,
      description: engineeringWorkspaces.description,
      status: engineeringWorkspaces.status,
      requiresMfa: engineeringWorkspaces.requiresMfa,
      role: engineeringWorkspaceMembers.role,
      membershipStatus: engineeringWorkspaceMembers.status,
      mfaVerifiedAt: engineeringWorkspaceMembers.mfaVerifiedAt,
    })
    .from(engineeringWorkspaceMembers)
    .innerJoin(engineeringWorkspaces, eq(engineeringWorkspaces.id, engineeringWorkspaceMembers.workspaceId))
    .where(and(eq(engineeringWorkspaceMembers.userId, userId), eq(engineeringWorkspaceMembers.status, "active")));
}

export async function getLiveEventAccessSubject(liveEventId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [event] = await db.select().from(liveEvents).where(eq(liveEvents.id, liveEventId)).limit(1);
  if (!event) return undefined;
  const creator = await getCreatorProfileById(event.creatorId);
  if (!creator) return undefined;
  return { event, creator };
}

export async function createCreatorLiveEvent(input: {
  creatorId: number;
  title: string;
  description?: string;
  accessType: "members" | "ticketed" | "private";
  scheduledStartAt: Date;
  scheduledEndAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const result = await db.insert(liveEvents).values({
    creatorId: input.creatorId,
    title: input.title,
    description: input.description ?? null,
    accessType: input.accessType,
    scheduledStartAt: input.scheduledStartAt,
    scheduledEndAt: input.scheduledEndAt ?? null,
    status: "scheduled",
  });
  return { id: result[0].insertId, status: "scheduled" as const };
}

export async function getCreatorProfileById(creatorId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [creator] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, creatorId)).limit(1);
  return creator;
}

export async function getActiveProduct(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [product] = await db.select().from(products).where(and(eq(products.id, productId), eq(products.status, "active"))).limit(1);
  return product;
}

export async function createPendingOrder(input: { buyerId: number; productId: number; provider: string; providerCheckoutId: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const product = await getActiveProduct(input.productId);
  if (!product) throw new Error("Product is unavailable.");
  const result = await db.insert(orders).values({
    buyerId: input.buyerId,
    creatorId: product.creatorId,
    productId: product.id,
    status: "pending",
    subtotal: product.price,
    platformFee: "0.00",
    revenueVertical: product.revenueVertical,
    total: product.price,
    currency: product.currency,
    provider: input.provider,
    providerCheckoutId: input.providerCheckoutId,
  });
  return { orderId: result[0].insertId, product };
}

export async function expirePendingOrder(checkoutId: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status: "canceled" }).where(and(eq(orders.providerCheckoutId, checkoutId), eq(orders.status, "pending")));
}

export async function fulfillPaidOrder(input: { checkoutId: string; paymentId: string | null; subscriptionId: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const [order] = await db.select().from(orders).where(eq(orders.providerCheckoutId, input.checkoutId)).limit(1);
  if (!order) return undefined;

  const [product] = await db.select().from(products).where(eq(products.id, order.productId)).limit(1);
  if (!product) throw new Error("Order product was not found.");
  if (order.status === "paid") return { orderId: order.id, fulfillment: "already_completed" } as const;

  await db.update(orders).set({ status: "paid", providerPaymentId: input.paymentId }).where(eq(orders.id, order.id));
  let resourceType: "creator_membership" | "post" | "live_event" | "bundle" = "bundle";
  let resourceId = product.id;
  if (product.productType === "subscription") {
    resourceType = "creator_membership";
    resourceId = product.creatorId;
    if (product.membershipTierId) {
      await db.insert(subscriptions).values({
        fanId: order.buyerId,
        creatorId: product.creatorId,
        membershipTierId: product.membershipTierId,
        provider: "stripe",
        providerSubscriptionId: input.subscriptionId,
        status: "active",
      }).onDuplicateKeyUpdate({ set: { status: "active" } });
    }
  } else if (product.productType === "post" && product.postId) {
    resourceType = "post";
    resourceId = product.postId;
  } else if (product.productType === "live_event" && product.liveEventId) {
    resourceType = "live_event";
    resourceId = product.liveEventId;
  }

  const existing = await db
    .select({ id: entitlements.id })
    .from(entitlements)
    .where(and(eq(entitlements.userId, order.buyerId), eq(entitlements.resourceType, resourceType), eq(entitlements.resourceId, resourceId), eq(entitlements.status, "active")))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(entitlements).values({
      userId: order.buyerId,
      creatorId: product.creatorId,
      resourceType,
      resourceId,
      sourceType: product.productType === "subscription" ? "subscription" : "purchase",
      sourceId: order.id,
      status: "active",
    });
  }
  return { orderId: order.id, fulfillment: "completed" } as const;
}

export async function getSiteSettings() {
  const db = await getDb();
  if (!db) return defaultSiteSettings;
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  return toPublicSiteSettings(rows[0]);
}

export async function upsertSiteSettings(input: SiteSettingsInput, updatedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.insert(siteSettings).values({ id: 1, ...input, updatedBy }).onDuplicateKeyUpdate({
    set: { ...input, updatedBy },
  });
  return getSiteSettings();
}

export async function getActiveSiteNotifications() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(siteNotifications).where(and(
    eq(siteNotifications.isActive, true),
    or(isNull(siteNotifications.startsAt), lte(siteNotifications.startsAt, now)),
    or(isNull(siteNotifications.endsAt), gte(siteNotifications.endsAt, now)),
  )).orderBy(desc(siteNotifications.createdAt)).limit(12);
}

export async function listSiteNotifications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteNotifications).orderBy(desc(siteNotifications.createdAt)).limit(50);
}

export async function createSiteNotification(input: NotificationInput, createdBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const result = await db.insert(siteNotifications).values({
    title: input.title,
    body: input.body,
    severity: input.severity,
    audience: input.audience,
    isActive: input.isActive,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
    createdBy,
  });
  const rows = await db.select().from(siteNotifications).where(eq(siteNotifications.id, result[0].insertId)).limit(1);
  return rows[0];
}

export async function setSiteNotificationActive(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  await db.update(siteNotifications).set({ isActive }).where(eq(siteNotifications.id, id));
  const rows = await db.select().from(siteNotifications).where(eq(siteNotifications.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function logAuditEvent(input: { actorId: number | null; action: string; targetType: string; targetId?: string | null; metadata?: Record<string, unknown> }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({
    actorId: input.actorId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata,
  });
}

export async function createReport(input: {
  reporterId: number | null;
  subjectType: "profile" | "post" | "asset" | "message" | "live_event" | "ad";
  subjectId: number;
  reason: string;
  detail?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const result = await db.insert(reports).values({
    reporterId: input.reporterId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    reason: input.reason,
    detail: input.detail ?? null,
  });
  await logAuditEvent({ actorId: input.reporterId, action: "safety.report_created", targetType: input.subjectType, targetId: String(input.subjectId), metadata: { reportId: result[0].insertId } });
  return { id: result[0].insertId };
}
