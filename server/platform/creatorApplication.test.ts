import { describe, expect, it } from "vitest";
import { canOpenCreatorStudio, canSubmitCreatorApplication } from "./creatorApplication";

describe("creator application policy", () => {
  it("allows only active fan or creator accounts to submit an application", () => {
    expect(canSubmitCreatorApplication({ id: 5, role: "fan", accountStatus: "active" })).toBe(true);
    expect(canSubmitCreatorApplication({ id: 5, role: "creator", accountStatus: "active" })).toBe(true);
    expect(canSubmitCreatorApplication({ id: 5, role: "admin", accountStatus: "active" })).toBe(false);
    expect(canSubmitCreatorApplication({ id: 5, role: "fan", accountStatus: "suspended" })).toBe(false);
  });

  it("keeps the monetization studio closed until all creator gates are verified", () => {
    expect(canOpenCreatorStudio({ applicationStatus: "approved", eligibilityStatus: "verified", payoutReadiness: "ready" })).toBe(true);
    expect(canOpenCreatorStudio({ applicationStatus: "approved", eligibilityStatus: "pending", payoutReadiness: "ready" })).toBe(false);
    expect(canOpenCreatorStudio({ applicationStatus: "approved", eligibilityStatus: "verified", payoutReadiness: "pending" })).toBe(false);
  });
});
