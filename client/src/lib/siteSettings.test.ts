import { describe, expect, it } from "vitest";
import { defaultSiteSettings, siteSettingsInputSchema, toPublicSiteSettings } from "@shared/siteSettings";

describe("site settings", () => {
  it("provides a safe branded fallback when persistence is unavailable", () => {
    expect(defaultSiteSettings.brandName).toBe("Creator Hub");
    expect(defaultSiteSettings.attributionLine).toContain("AXIOM-HIVE TECHNOLOGY");
    expect(toPublicSiteSettings(null)).toEqual(defaultSiteSettings);
  });

  it("rejects empty presentation copy before an admin save", () => {
    const parsed = siteSettingsInputSchema.safeParse({ ...defaultSiteSettings, heroCopy: "" });
    expect(parsed.success).toBe(false);
  });
});
