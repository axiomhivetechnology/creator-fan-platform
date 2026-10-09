import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const userRoles = ["fan", "creator", "moderator", "finance", "admin"] as const;
export const accountStatuses = ["active", "pending_review", "suspended", "closed"] as const;

/**
 * Account identity is supplied by the configured authentication provider.
 * The platform stores role, age acknowledgement, consent, and account status
 * but never stores password or payment-card credentials.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", userRoles).default("fan").notNull(),
  accountStatus: mysqlEnum("accountStatus", accountStatuses).default("active").notNull(),
  ageAcknowledgedAt: timestamp("ageAcknowledgedAt"),
  marketingConsentAt: timestamp("marketingConsentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Public presentation settings are intentionally limited to copy and visibility
 * controls. Creator identity, payouts, payment-provider credentials, and
 * compliance evidence remain outside the easy editor.
 */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").primaryKey(),
  brandName: varchar("brandName", { length: 120 }).notNull(),
  attributionLine: varchar("attributionLine", { length: 180 }).notNull(),
  heroEyebrow: varchar("heroEyebrow", { length: 120 }).notNull(),
  heroTitle: varchar("heroTitle", { length: 160 }).notNull(),
  heroAccent: varchar("heroAccent", { length: 80 }).notNull(),
  heroCopy: text("heroCopy").notNull(),
  membershipLabel: varchar("membershipLabel", { length: 120 }).notNull(),
  showEarlyCircle: boolean("showEarlyCircle").default(true).notNull(),
  showSafetyPanel: boolean("showSafetyPanel").default(true).notNull(),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const siteNotifications = mysqlTable(
  "siteNotifications",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 120 }).notNull(),
    body: text("body").notNull(),
    severity: mysqlEnum("severity", ["info", "success", "warning", "urgent"]).default("info").notNull(),
    audience: mysqlEnum("audience", ["everyone", "fans", "creators", "staff", "admins"]).default("everyone").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    startsAt: timestamp("startsAt"),
    endsAt: timestamp("endsAt"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("site_notifications_active_window").on(table.isActive, table.startsAt, table.endsAt, table.createdAt)],
);

/**
 * Premium Access is the platform-level prerequisite for entering the private
 * creator network. It is deliberately separate from creator memberships,
 * PPV purchases, and live-event tickets.
 */
export const platformAccessPlans = mysqlTable(
  "platformAccessPlans",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 48 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    monthlyPrice: decimal("monthlyPrice", { precision: 12, scale: 2 }),
    annualPrice: decimal("annualPrice", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
    providerProductId: varchar("providerProductId", { length: 256 }),
    providerMonthlyPriceId: varchar("providerMonthlyPriceId", { length: 256 }),
    providerAnnualPriceId: varchar("providerAnnualPriceId", { length: 256 }),
    policyVersion: varchar("policyVersion", { length: 48 }).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("platform_access_plans_code_unique").on(table.code), index("platform_access_plans_status_sort").on(table.status, table.sortOrder)],
);

export const platformSubscriptions = mysqlTable(
  "platformSubscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    planId: int("planId").notNull(),
    provider: varchar("provider", { length: 48 }),
    providerCustomerId: varchar("providerCustomerId", { length: 256 }),
    providerSubscriptionId: varchar("providerSubscriptionId", { length: 256 }),
    status: mysqlEnum("status", ["pending", "active", "grace", "canceled", "expired", "revoked"])
      .default("pending")
      .notNull(),
    currentPeriodStart: timestamp("currentPeriodStart"),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("platform_subscriptions_user_status").on(table.userId, table.status),
    uniqueIndex("platform_subscriptions_provider_unique").on(table.providerSubscriptionId),
  ],
);

export const creatorProfiles = mysqlTable(
  "creatorProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    handle: varchar("handle", { length: 64 }).notNull(),
    displayName: varchar("displayName", { length: 120 }).notNull(),
    bio: text("bio"),
    avatarUrl: text("avatarUrl"),
    bannerUrl: text("bannerUrl"),
    category: varchar("category", { length: 80 }),
    isDiscoverable: boolean("isDiscoverable").default(true).notNull(),
    approvalStatus: mysqlEnum("approvalStatus", ["draft", "pending", "approved", "rejected", "paused"])
      .default("draft")
      .notNull(),
    payoutStatus: mysqlEnum("payoutStatus", ["not_started", "pending", "ready", "restricted"])
      .default("not_started")
      .notNull(),
    messagePolicy: mysqlEnum("messagePolicy", ["premium_members", "creator_members", "disabled"])
      .default("creator_members")
      .notNull(),
    allowTips: boolean("allowTips").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("creator_profiles_user_id_unique").on(table.userId),
    uniqueIndex("creator_profiles_handle_unique").on(table.handle),
  ],
);

/**
 * Creator applications hold non-document workflow state. Identity, age,
 * consent, and other restricted compliance evidence must remain with the
 * approved verification/evidence service rather than ordinary app records.
 */
export const creatorApplications = mysqlTable(
  "creatorApplications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    displayName: varchar("displayName", { length: 120 }).notNull(),
    proposedHandle: varchar("proposedHandle", { length: 64 }).notNull(),
    category: varchar("category", { length: 80 }),
    applicationNote: text("applicationNote"),
    agreementVersion: varchar("agreementVersion", { length: 48 }).notNull(),
    agreementAcceptedAt: timestamp("agreementAcceptedAt"),
    eligibilityStatus: mysqlEnum("eligibilityStatus", ["not_started", "pending", "verified", "failed", "expired"])
      .default("not_started")
      .notNull(),
    payoutReadiness: mysqlEnum("payoutReadiness", ["not_started", "pending", "ready", "restricted"])
      .default("not_started")
      .notNull(),
    status: mysqlEnum("status", ["draft", "submitted", "needs_info", "approved", "rejected", "restricted"])
      .default("draft")
      .notNull(),
    reviewNote: text("reviewNote"),
    reviewedBy: int("reviewedBy"),
    submittedAt: timestamp("submittedAt"),
    reviewedAt: timestamp("reviewedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("creator_applications_user_unique").on(table.userId), index("creator_applications_status_created").on(table.status, table.createdAt)],
);

export const membershipTiers = mysqlTable(
  "membershipTiers",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorId: int("creatorId").notNull(),
    name: varchar("name", { length: 96 }).notNull(),
    description: text("description"),
    monthlyPrice: decimal("monthlyPrice", { precision: 12, scale: 2 }).notNull(),
    annualPrice: decimal("annualPrice", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("membership_tiers_creator_active").on(table.creatorId, table.isActive)],
);

export const posts = mysqlTable(
  "posts",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorId: int("creatorId").notNull(),
    title: varchar("title", { length: 180 }),
    body: text("body"),
    accessType: mysqlEnum("accessType", ["public", "members", "ppv", "private"])
      .default("members")
      .notNull(),
    membershipTierId: int("membershipTierId"),
    ppvPrice: decimal("ppvPrice", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    publicationStatus: mysqlEnum("publicationStatus", ["draft", "scheduled", "published", "archived", "removed"])
      .default("draft")
      .notNull(),
    publishedAt: timestamp("publishedAt"),
    scheduledFor: timestamp("scheduledFor"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("posts_creator_published").on(table.creatorId, table.publicationStatus, table.publishedAt)],
);

export const contentAssets = mysqlTable(
  "contentAssets",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorId: int("creatorId").notNull(),
    postId: int("postId"),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    contentType: varchar("contentType", { length: 160 }).notNull(),
    byteSize: int("byteSize").notNull(),
    displayOrder: int("displayOrder").default(0).notNull(),
    moderationStatus: mysqlEnum("moderationStatus", ["pending", "approved", "rejected", "removed"])
      .default("pending")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("content_assets_post_order").on(table.postId, table.displayOrder)],
);

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorId: int("creatorId").notNull(),
    postId: int("postId"),
    liveEventId: int("liveEventId"),
    membershipTierId: int("membershipTierId"),
    productType: mysqlEnum("productType", ["subscription", "post", "bundle", "live_event"])
      .notNull(),
    revenueVertical: mysqlEnum("revenueVertical", ["platform_membership", "creator_subscription", "paid_content", "live_gifting", "b2b_workspace"])
      .default("paid_content")
      .notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    status: mysqlEnum("status", ["draft", "active", "paused", "archived"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("products_creator_status").on(table.creatorId, table.status)],
);

export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    buyerId: int("buyerId").notNull(),
    creatorId: int("creatorId").notNull(),
    productId: int("productId").notNull(),
    status: mysqlEnum("status", ["created", "pending", "paid", "refunded", "disputed", "failed", "canceled"])
      .default("created")
      .notNull(),
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
    platformFee: decimal("platformFee", { precision: 12, scale: 2 }).default("0.00").notNull(),
    revenueVertical: mysqlEnum("revenueVertical", ["platform_membership", "creator_subscription", "paid_content", "live_gifting", "b2b_workspace"])
      .default("paid_content")
      .notNull(),
    merchantProcessingFee: decimal("merchantProcessingFee", { precision: 12, scale: 2 }),
    ecosystemNet: decimal("ecosystemNet", { precision: 12, scale: 2 }),
    total: decimal("total", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    provider: varchar("provider", { length: 48 }),
    providerCheckoutId: varchar("providerCheckoutId", { length: 256 }),
    providerPaymentId: varchar("providerPaymentId", { length: 256 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("orders_buyer_created").on(table.buyerId, table.createdAt),
    index("orders_creator_created").on(table.creatorId, table.createdAt),
    uniqueIndex("orders_provider_checkout_unique").on(table.providerCheckoutId),
  ],
);

export const tokenAccounts = mysqlTable(
  "tokenAccounts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    balance: int("balance").default(0).notNull(),
    status: mysqlEnum("status", ["active", "frozen", "closed"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("token_accounts_user_unique").on(table.userId)],
);

export const tokenLedgerEntries = mysqlTable(
  "tokenLedgerEntries",
  {
    id: int("id").autoincrement().primaryKey(),
    accountId: int("accountId").notNull(),
    userId: int("userId").notNull(),
    creatorId: int("creatorId"),
    liveEventId: int("liveEventId"),
    direction: mysqlEnum("direction", ["credit", "debit", "reversal"]).notNull(),
    amount: int("amount").notNull(),
    referenceType: varchar("referenceType", { length: 64 }).notNull(),
    referenceId: varchar("referenceId", { length: 128 }).notNull(),
    idempotencyKey: varchar("idempotencyKey", { length: 128 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("token_ledger_idempotency_unique").on(table.idempotencyKey),
    index("token_ledger_account_created").on(table.accountId, table.createdAt),
  ],
);

export const engineeringWorkspaces = mysqlTable(
  "engineeringWorkspaces",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull(),
    slug: varchar("slug", { length: 96 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
    requiresMfa: boolean("requiresMfa").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("engineering_workspaces_slug_unique").on(table.slug), index("engineering_workspaces_owner_status").on(table.ownerId, table.status)],
);

export const engineeringWorkspaceMembers = mysqlTable(
  "engineeringWorkspaceMembers",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["owner", "engineer", "creator", "viewer"]).notNull(),
    status: mysqlEnum("status", ["invited", "active", "suspended", "removed"]).default("invited").notNull(),
    mfaVerifiedAt: timestamp("mfaVerifiedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("engineering_workspace_members_unique").on(table.workspaceId, table.userId), index("engineering_workspace_members_user_status").on(table.userId, table.status)],
);

export const subscriptions = mysqlTable(
  "subscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    fanId: int("fanId").notNull(),
    creatorId: int("creatorId").notNull(),
    membershipTierId: int("membershipTierId").notNull(),
    provider: varchar("provider", { length: 48 }),
    providerSubscriptionId: varchar("providerSubscriptionId", { length: 256 }),
    status: mysqlEnum("status", ["pending", "active", "grace", "canceled", "expired", "paused"])
      .default("pending")
      .notNull(),
    currentPeriodStart: timestamp("currentPeriodStart"),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("subscriptions_fan_status").on(table.fanId, table.status),
    index("subscriptions_creator_status").on(table.creatorId, table.status),
    uniqueIndex("subscriptions_provider_unique").on(table.providerSubscriptionId),
  ],
);

export const entitlements = mysqlTable(
  "entitlements",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    creatorId: int("creatorId"),
    resourceType: mysqlEnum("resourceType", ["premium_access", "creator_membership", "post", "live_event", "bundle"])
      .notNull(),
    resourceId: int("resourceId").notNull(),
    sourceType: mysqlEnum("sourceType", ["subscription", "purchase", "complimentary", "admin"])
      .notNull(),
    sourceId: int("sourceId"),
    status: mysqlEnum("status", ["active", "grace", "expired", "revoked"])
      .default("active")
      .notNull(),
    validFrom: timestamp("validFrom").defaultNow().notNull(),
    validUntil: timestamp("validUntil"),
    revokedAt: timestamp("revokedAt"),
    revokeReason: varchar("revokeReason", { length: 300 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("entitlements_user_resource_status").on(table.userId, table.resourceType, table.resourceId, table.status)],
);

export const liveEvents = mysqlTable(
  "liveEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorId: int("creatorId").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    accessType: mysqlEnum("accessType", ["public", "members", "ticketed", "private"])
      .default("members")
      .notNull(),
    productId: int("productId"),
    scheduledStartAt: timestamp("scheduledStartAt").notNull(),
    scheduledEndAt: timestamp("scheduledEndAt"),
    status: mysqlEnum("status", ["draft", "scheduled", "live", "ended", "canceled"])
      .default("draft")
      .notNull(),
    providerStreamId: varchar("providerStreamId", { length: 256 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("live_events_creator_start").on(table.creatorId, table.scheduledStartAt)],
);

export const tips = mysqlTable(
  "tips",
  {
    id: int("id").autoincrement().primaryKey(),
    fanId: int("fanId").notNull(),
    creatorId: int("creatorId").notNull(),
    postId: int("postId"),
    liveEventId: int("liveEventId"),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    message: varchar("message", { length: 500 }),
    status: mysqlEnum("status", ["pending", "paid", "refunded", "failed"]).default("pending").notNull(),
    providerPaymentId: varchar("providerPaymentId", { length: 256 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("tips_creator_created").on(table.creatorId, table.createdAt)],
);

export const conversations = mysqlTable(
  "conversations",
  {
    id: int("id").autoincrement().primaryKey(),
    fanId: int("fanId").notNull(),
    creatorId: int("creatorId").notNull(),
    status: mysqlEnum("status", ["open", "archived", "restricted"]).default("open").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("conversations_fan_creator_unique").on(table.fanId, table.creatorId)],
);

export const creatorFollows = mysqlTable(
  "creatorFollows",
  {
    id: int("id").autoincrement().primaryKey(),
    fanId: int("fanId").notNull(),
    creatorId: int("creatorId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("creator_follows_fan_creator_unique").on(table.fanId, table.creatorId), index("creator_follows_creator_created").on(table.creatorId, table.createdAt)],
);

export const accountBlocks = mysqlTable(
  "accountBlocks",
  {
    id: int("id").autoincrement().primaryKey(),
    blockerUserId: int("blockerUserId").notNull(),
    blockedUserId: int("blockedUserId").notNull(),
    reason: varchar("reason", { length: 300 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("account_blocks_pair_unique").on(table.blockerUserId, table.blockedUserId)],
);

export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull(),
    senderId: int("senderId").notNull(),
    body: text("body"),
    status: mysqlEnum("status", ["sent", "removed", "reported"]).default("sent").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("messages_conversation_created").on(table.conversationId, table.createdAt)],
);

export const adPlacements = mysqlTable(
  "adPlacements",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorId: int("creatorId"),
    placement: varchar("placement", { length: 80 }).notNull(),
    label: varchar("label", { length: 180 }).notNull(),
    sponsorName: varchar("sponsorName", { length: 180 }),
    destinationUrl: text("destinationUrl"),
    disclosureText: varchar("disclosureText", { length: 300 }).notNull(),
    status: mysqlEnum("status", ["draft", "pending_review", "approved", "paused", "rejected"])
      .default("draft")
      .notNull(),
    targeting: json("targeting"),
    startsAt: timestamp("startsAt"),
    endsAt: timestamp("endsAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("ad_placements_status_window").on(table.status, table.startsAt, table.endsAt)],
);

export const reports = mysqlTable(
  "reports",
  {
    id: int("id").autoincrement().primaryKey(),
    reporterId: int("reporterId"),
    subjectType: mysqlEnum("subjectType", ["profile", "post", "asset", "message", "live_event", "ad"])
      .notNull(),
    subjectId: int("subjectId").notNull(),
    reason: varchar("reason", { length: 120 }).notNull(),
    detail: text("detail"),
    status: mysqlEnum("status", ["open", "under_review", "actioned", "dismissed"])
      .default("open")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    resolvedAt: timestamp("resolvedAt"),
  },
  table => [index("reports_status_created").on(table.status, table.createdAt)],
);

export const moderationActions = mysqlTable(
  "moderationActions",
  {
    id: int("id").autoincrement().primaryKey(),
    reportId: int("reportId"),
    actorId: int("actorId").notNull(),
    subjectType: varchar("subjectType", { length: 64 }).notNull(),
    subjectId: int("subjectId").notNull(),
    action: mysqlEnum("action", ["note", "remove", "restrict", "suspend", "restore", "dismiss"])
      .notNull(),
    rationale: text("rationale"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("moderation_actions_subject_created").on(table.subjectType, table.subjectId, table.createdAt)],
);

export const auditLogs = mysqlTable(
  "auditLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    actorId: int("actorId"),
    action: varchar("action", { length: 120 }).notNull(),
    targetType: varchar("targetType", { length: 64 }).notNull(),
    targetId: varchar("targetId", { length: 120 }),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("audit_logs_target_created").on(table.targetType, table.targetId, table.createdAt)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;
export type SiteNotification = typeof siteNotifications.$inferSelect;
export type InsertSiteNotification = typeof siteNotifications.$inferInsert;
export type PlatformAccessPlan = typeof platformAccessPlans.$inferSelect;
export type PlatformSubscription = typeof platformSubscriptions.$inferSelect;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type CreatorApplication = typeof creatorApplications.$inferSelect;
export type MembershipTier = typeof membershipTiers.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type TokenAccount = typeof tokenAccounts.$inferSelect;
export type TokenLedgerEntry = typeof tokenLedgerEntries.$inferSelect;
export type EngineeringWorkspace = typeof engineeringWorkspaces.$inferSelect;
export type EngineeringWorkspaceMember = typeof engineeringWorkspaceMembers.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Entitlement = typeof entitlements.$inferSelect;
export type LiveEvent = typeof liveEvents.$inferSelect;
