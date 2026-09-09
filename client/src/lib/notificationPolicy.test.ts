import { describe, expect, it } from "vitest";
import { canViewNotification, notificationInputSchema } from "@shared/notifications";
import { canUseDeveloperEditor } from "@shared/rolePolicy";

const baseNotification = {
  title: "Maintenance",
  body: "A short member-facing notice.",
  severity: "info" as const,
  audience: "everyone" as const,
  isActive: true,
  startsAt: null,
  endsAt: null,
};

describe("notification and developer access policy", () => {
  it("keeps notifications audience-scoped", () => {
    expect(canViewNotification("everyone", null)).toBe(true);
    expect(canViewNotification("fans", "fan")).toBe(true);
    expect(canViewNotification("fans", "creator")).toBe(false);
    expect(canViewNotification("staff", "moderator")).toBe(true);
    expect(canViewNotification("admins", "admin")).toBe(true);
  });

  it("rejects a notification whose end precedes its start", () => {
    const parsed = notificationInputSchema.safeParse({
      ...baseNotification,
      startsAt: new Date("2026-01-02T00:00:00Z"),
      endsAt: new Date("2026-01-01T00:00:00Z"),
    });
    expect(parsed.success).toBe(false);
  });

  it("denies the developer editor to non-admin or inactive accounts", () => {
    expect(canUseDeveloperEditor({ role: "admin", accountStatus: "active" })).toBe(true);
    expect(canUseDeveloperEditor({ role: "creator", accountStatus: "active" })).toBe(false);
    expect(canUseDeveloperEditor({ role: "admin", accountStatus: "suspended" })).toBe(false);
  });
});
