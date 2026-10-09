import { describe, expect, it } from "vitest";
import { calculateTransactionEconomics, canUseRevenueVertical } from "./monetization";

describe("monetization policy", () => {
  it("retains the full gross amount less only baseline merchant processing", () => {
    expect(calculateTransactionEconomics({ grossAmount: 100, vertical: "creator_subscription" })).toEqual({
      grossAmount: 100,
      platformFee: 0,
      merchantProcessingFee: 3.2,
      netEcosystemAmount: 96.8,
      currency: "USD",
      vertical: "creator_subscription",
    });
  });

  it("rejects invalid transaction amounts", () => {
    expect(() => calculateTransactionEconomics({ grossAmount: 0, vertical: "paid_content" })).toThrow();
    expect(() => calculateTransactionEconomics({ grossAmount: -1, vertical: "paid_content" })).toThrow();
  });

  it("requires Premium Access before creator or B2B network activity", () => {
    expect(canUseRevenueVertical("platform_membership", { accountIsActive: true, hasActivePremiumAccess: false })).toBe(true);
    expect(canUseRevenueVertical("b2b_workspace", { accountIsActive: true, hasActivePremiumAccess: false })).toBe(false);
    expect(canUseRevenueVertical("b2b_workspace", { accountIsActive: true, hasActivePremiumAccess: true })).toBe(true);
    expect(canUseRevenueVertical("creator_subscription", { accountIsActive: true, hasActivePremiumAccess: true, creatorIsApproved: true, payoutIsReady: true })).toBe(true);
    expect(canUseRevenueVertical("creator_subscription", { accountIsActive: true, hasActivePremiumAccess: true, creatorIsApproved: true, payoutIsReady: false })).toBe(false);
  });
});
