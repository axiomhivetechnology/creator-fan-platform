import type { PlatformUser } from "./access";
import { canEnterPremiumNetwork, hasActiveAccount } from "./access";

export type WorkspaceRole = "owner" | "engineer" | "creator" | "viewer";

export function canCreatePrivateWorkspace(user: PlatformUser | null | undefined, premiumStatus: Parameters<typeof canEnterPremiumNetwork>[1]) {
  return Boolean(hasActiveAccount(user) && canEnterPremiumNetwork(user, premiumStatus) && (user.role === "creator" || user.role === "admin"));
}

export function canViewPrivateWorkspace(input: {
  user: PlatformUser | null | undefined;
  premiumStatus: Parameters<typeof canEnterPremiumNetwork>[1];
  membershipStatus: "invited" | "active" | "suspended" | "removed";
  workspaceStatus: "draft" | "active" | "archived";
  requiresMfa: boolean;
  mfaVerified: boolean;
}) {
  if (!hasActiveAccount(input.user) || !canEnterPremiumNetwork(input.user, input.premiumStatus)) return false;
  if (input.membershipStatus !== "active" || input.workspaceStatus !== "active") return false;
  return !input.requiresMfa || input.mfaVerified;
}

export function canSendTokenGift(input: {
  user: PlatformUser | null | undefined;
  premiumStatus: Parameters<typeof canEnterPremiumNetwork>[1];
  creatorApproved: boolean;
  creatorAllowsTips: boolean;
  amount: number;
}) {
  return Boolean(
    hasActiveAccount(input.user) &&
      canEnterPremiumNetwork(input.user, input.premiumStatus) &&
      input.creatorApproved &&
      input.creatorAllowsTips &&
      Number.isInteger(input.amount) &&
      input.amount > 0,
  );
}
