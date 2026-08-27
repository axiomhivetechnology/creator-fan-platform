import type { PlatformUser } from "./access";
import { hasActiveAccount } from "./access";

export function canSubmitCreatorApplication(user: PlatformUser | null | undefined) {
  return Boolean(hasActiveAccount(user) && (user.role === "fan" || user.role === "creator"));
}

export function canOpenCreatorStudio(input: { applicationStatus: string | undefined; eligibilityStatus: string | undefined; payoutReadiness: string | undefined }) {
  return input.applicationStatus === "approved" && input.eligibilityStatus === "verified" && input.payoutReadiness === "ready";
}
