import { describe, expect, it } from "vitest";
import type { PlatformUser } from "./access";
import {
  canAccessProtectedResource,
  canManageCreatorAccount,
  canModeratePlatform,
  canPurchaseFromCreator,
  canReviewRevenue,
} from "./access";

const fan: PlatformUser = { id: 8, role: "fan", accountStatus: "active" };
const creator: PlatformUser = { id: 11, role: "creator", accountStatus: "active" };
const admin: PlatformUser = { id: 1, role: "admin", accountStatus: "active" };
const moderator: PlatformUser = { id: 2, role: "moderator", accountStatus: "active" };
const finance: PlatformUser = { id: 3, role: "finance", accountStatus: "active" };
const suspendedFan: PlatformUser = { id: 9, role: "fan", accountStatus: "suspended" };

describe("platform access policy", () => {
  it("permits public posts but gates member and PPV content behind a valid entitlement", () => {
    expect(
      canAccessProtectedResource({ viewer: null, ownerUserId: creator.id, accessType: "public", hasActiveEntitlement: false }),
    ).toBe(true);
    expect(
      canAccessProtectedResource({ viewer: fan, ownerUserId: creator.id, accessType: "members", hasActiveEntitlement: false }),
    ).toBe(false);
    expect(
      canAccessProtectedResource({ viewer: fan, ownerUserId: creator.id, accessType: "ppv", hasActiveEntitlement: true }),
    ).toBe(true);
    expect(
      canAccessProtectedResource({ viewer: suspendedFan, ownerUserId: creator.id, accessType: "ppv", hasActiveEntitlement: true }),
    ).toBe(false);
    expect(
      canAccessProtectedResource({ viewer: fan, ownerUserId: creator.id, accessType: "ticketed", hasActiveEntitlement: true }),
    ).toBe(true);
  });

  it("permits only the resource owner or an administrator to manage unpublished content", () => {
    expect(canManageCreatorAccount(creator, creator.id)).toBe(true);
    expect(canManageCreatorAccount(fan, creator.id)).toBe(false);
    expect(canManageCreatorAccount(admin, creator.id)).toBe(true);
    expect(
      canAccessProtectedResource({
        viewer: creator,
        ownerUserId: creator.id,
        accessType: "members",
        hasActiveEntitlement: false,
        isPublished: false,
      }),
    ).toBe(true);
  });

  it("scopes financial and moderation powers to the appropriate active roles", () => {
    expect(canReviewRevenue(creator, creator.id)).toBe(true);
    expect(canReviewRevenue(finance, creator.id)).toBe(true);
    expect(canReviewRevenue(fan, creator.id)).toBe(false);
    expect(canModeratePlatform(moderator)).toBe(true);
    expect(canModeratePlatform(finance)).toBe(true);
    expect(canModeratePlatform(suspendedFan)).toBe(false);
  });

  it("does not permit a creator to purchase their own product", () => {
    expect(canPurchaseFromCreator(fan, creator.id)).toBe(true);
    expect(canPurchaseFromCreator(creator, creator.id)).toBe(false);
  });
});
