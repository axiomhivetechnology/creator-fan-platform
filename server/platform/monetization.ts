export const revenueVerticals = [
  "platform_membership",
  "creator_subscription",
  "paid_content",
  "live_gifting",
  "b2b_workspace",
] as const;

export type RevenueVertical = (typeof revenueVerticals)[number];

export type MerchantProcessingConfig = {
  percentageRate: number;
  fixedAmount: number;
};

export type TransactionEconomics = {
  grossAmount: number;
  platformFee: number;
  merchantProcessingFee: number;
  netEcosystemAmount: number;
  currency: string;
  vertical: RevenueVertical;
};

/**
 * Creator Hub does not take a platform commission. The only modeled deduction
 * at checkout is the baseline merchant processing estimate. Provider fees,
 * refunds, reserves, taxes, payouts, and disputes must be reconciled from
 * authoritative provider events before a transaction is treated as settled.
 */
export function calculateTransactionEconomics(input: {
  grossAmount: number;
  currency?: string;
  vertical: RevenueVertical;
  processing?: MerchantProcessingConfig;
}): TransactionEconomics {
  if (!Number.isFinite(input.grossAmount) || input.grossAmount <= 0) {
    throw new Error("grossAmount must be greater than zero.");
  }
  const processing = input.processing ?? { percentageRate: 0.029, fixedAmount: 0.3 };
  if (processing.percentageRate < 0 || processing.percentageRate >= 1 || processing.fixedAmount < 0) {
    throw new Error("Invalid merchant processing configuration.");
  }
  const grossAmount = roundCurrency(input.grossAmount);
  const merchantProcessingFee = roundCurrency(grossAmount * processing.percentageRate + processing.fixedAmount);
  return {
    grossAmount,
    platformFee: 0,
    merchantProcessingFee,
    netEcosystemAmount: roundCurrency(grossAmount - merchantProcessingFee),
    currency: (input.currency ?? "USD").toUpperCase(),
    vertical: input.vertical,
  };
}

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export type MonetizationGateInput = {
  hasActivePremiumAccess: boolean;
  accountIsActive: boolean;
  creatorIsApproved?: boolean;
  payoutIsReady?: boolean;
};

/**
 * Returns the server-side prerequisites for each monetization vertical. This
 * is a policy helper only; callers must still load and authorize the resource
 * they are about to mutate.
 */
export function canUseRevenueVertical(vertical: RevenueVertical, input: MonetizationGateInput) {
  if (!input.accountIsActive) return false;
  if (vertical === "platform_membership") return true;
  if (!input.hasActivePremiumAccess) return false;
  if (vertical === "b2b_workspace") return true;
  return Boolean(input.creatorIsApproved && input.payoutIsReady);
}

export const monetizationCatalog = [
  { vertical: "platform_membership", label: "Premium Access", recurring: true, description: "Platform-level authorization for the private creator network." },
  { vertical: "creator_subscription", label: "Creator subscriptions", recurring: true, description: "High-margin recurring memberships sold by approved creators." },
  { vertical: "paid_content", label: "Paid content", recurring: false, description: "Protected posts and digital drops unlocked by entitlement." },
  { vertical: "live_gifting", label: "Live token gifting", recurring: false, description: "Provider-backed token gifts with a server-audited balance and ledger." },
  { vertical: "b2b_workspace", label: "Private engineering workspaces", recurring: true, description: "Premium professional workspaces with explicit membership authorization." },
] as const;
