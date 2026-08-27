import { describe, expect, it } from "vitest";
import { makePremiumAccessDecision } from "./premium";

describe("Premium Access decision", () => {
  it("grants network entry only to a current premium entitlement", () => {
    expect(makePremiumAccessDecision("active")).toEqual({ status: "active", allowed: true, nextStep: "enter_network" });
    expect(makePremiumAccessDecision("none")).toEqual({ status: "none", allowed: false, nextStep: "select_plan" });
  });

  it("directs billing lifecycle states to recovery without exposing the premium network", () => {
    expect(makePremiumAccessDecision("grace")).toEqual({ status: "grace", allowed: false, nextStep: "recover_billing" });
    expect(makePremiumAccessDecision("expired")).toEqual({ status: "expired", allowed: false, nextStep: "recover_billing" });
    expect(makePremiumAccessDecision("revoked")).toEqual({ status: "revoked", allowed: false, nextStep: "contact_support" });
  });
});
