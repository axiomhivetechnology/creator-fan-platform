import type { PremiumAccessStatus } from "./access";

export type PremiumAccessDecision = {
  status: PremiumAccessStatus;
  allowed: boolean;
  nextStep: "enter_network" | "select_plan" | "recover_billing" | "contact_support";
};

export function makePremiumAccessDecision(status: PremiumAccessStatus): PremiumAccessDecision {
  if (status === "active") return { status, allowed: true, nextStep: "enter_network" };
  if (status === "grace" || status === "canceled" || status === "expired") {
    return { status, allowed: false, nextStep: "recover_billing" };
  }
  if (status === "revoked") return { status, allowed: false, nextStep: "contact_support" };
  return { status, allowed: false, nextStep: "select_plan" };
}
