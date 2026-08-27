import type { User } from "../../drizzle/schema";

export type PlatformUser = Pick<User, "id" | "role" | "accountStatus">;
export type ProtectedAccessType = "public" | "members" | "ppv" | "private" | "ticketed";

export type ResourceAccessInput = {
  viewer: PlatformUser | null | undefined;
  ownerUserId: number;
  accessType: ProtectedAccessType;
  hasActiveEntitlement: boolean;
  isPublished?: boolean;
};

const moderationRoles = new Set<PlatformUser["role"]>(["moderator", "admin"]);

export function hasActiveAccount(user: PlatformUser | null | undefined): user is PlatformUser {
  return Boolean(user && user.accountStatus === "active");
}

export type PremiumAccessStatus = "none" | "pending" | "active" | "grace" | "canceled" | "expired" | "revoked";

/**
 * Premium Access is a platform-level gate. A resource can impose additional
 * creator membership, PPV, ticket, ownership, or staff requirements.
 */
export function hasPremiumAccess(user: PlatformUser | null | undefined, premiumStatus: PremiumAccessStatus) {
  return hasActiveAccount(user) && premiumStatus === "active";
}

export function canEnterPremiumNetwork(user: PlatformUser | null | undefined, premiumStatus: PremiumAccessStatus) {
  return hasPremiumAccess(user, premiumStatus);
}

export function canManageCreatorAccount(user: PlatformUser | null | undefined, creatorUserId: number) {
  if (!hasActiveAccount(user)) return false;
  return user.role === "admin" || (user.role === "creator" && user.id === creatorUserId);
}

export function canModeratePlatform(user: PlatformUser | null | undefined) {
  return Boolean(hasActiveAccount(user) && moderationRoles.has(user.role));
}

export function canAdministerPlatform(user: PlatformUser | null | undefined) {
  return Boolean(hasActiveAccount(user) && user.role === "admin");
}

export function canReviewRevenue(user: PlatformUser | null | undefined, creatorUserId: number) {
  if (!hasActiveAccount(user)) return false;
  return user.role === "admin" || user.role === "finance" || (user.role === "creator" && user.id === creatorUserId);
}

export function canAccessProtectedResource({
  viewer,
  ownerUserId,
  accessType,
  hasActiveEntitlement,
  isPublished = true,
}: ResourceAccessInput) {
  if (!isPublished) {
    return Boolean(viewer && canManageCreatorAccount(viewer, ownerUserId));
  }

  if (accessType === "public") return true;
  if (!hasActiveAccount(viewer)) return false;

  if (viewer.role === "admin" || viewer.id === ownerUserId) return true;
  if (accessType === "private") return false;

  return hasActiveEntitlement;
}

export function canPurchaseFromCreator(user: PlatformUser | null | undefined, creatorUserId: number) {
  return Boolean(hasActiveAccount(user) && user.id !== creatorUserId);
}
