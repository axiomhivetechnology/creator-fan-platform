import { describe, expect, it } from "vitest";
import { canCreatePrivateWorkspace, canSendTokenGift, canViewPrivateWorkspace } from "./collaboration";
import type { PlatformUser } from "./access";

const creator: PlatformUser = { id: 10, role: "creator", accountStatus: "active" };
const fan: PlatformUser = { id: 11, role: "fan", accountStatus: "active" };

describe("collaboration and token policies", () => {
  it("requires Premium Access and creator/admin role to create a private workspace", () => {
    expect(canCreatePrivateWorkspace(creator, "active")).toBe(true);
    expect(canCreatePrivateWorkspace(creator, "none")).toBe(false);
    expect(canCreatePrivateWorkspace(fan, "active")).toBe(false);
  });

  it("requires active membership and MFA when a workspace requires it", () => {
    const base = { user: fan, premiumStatus: "active" as const, membershipStatus: "active" as const, workspaceStatus: "active" as const, requiresMfa: true };
    expect(canViewPrivateWorkspace({ ...base, mfaVerified: false })).toBe(false);
    expect(canViewPrivateWorkspace({ ...base, mfaVerified: true })).toBe(true);
    expect(canViewPrivateWorkspace({ ...base, membershipStatus: "invited", mfaVerified: true })).toBe(false);
  });

  it("requires an approved creator, enabled tips, and a positive integer token amount", () => {
    const base = { user: fan, premiumStatus: "active" as const, creatorApproved: true, creatorAllowsTips: true };
    expect(canSendTokenGift({ ...base, amount: 25 })).toBe(true);
    expect(canSendTokenGift({ ...base, amount: 0 })).toBe(false);
    expect(canSendTokenGift({ ...base, amount: 1.5 })).toBe(false);
    expect(canSendTokenGift({ ...base, creatorAllowsTips: false, amount: 25 })).toBe(false);
  });
});
