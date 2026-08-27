import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditLogs,
  creatorProfiles,
  entitlements,
  InsertUser,
  orders,
  posts,
  products,
  reports,
  liveEvents,
  subscriptions,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

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

export async function getLiveEventAccessSubject(liveEventId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [event] = await db.select().from(liveEvents).where(eq(liveEvents.id, liveEventId)).limit(1);
  if (!event) return undefined;
  const creator = await getCreatorProfileById(event.creatorId);
  if (!creator) return undefined;
  return { event, creator };
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
