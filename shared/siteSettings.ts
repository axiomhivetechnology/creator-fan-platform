import { z } from "zod";

export const siteSettingsInputSchema = z.object({
  brandName: z.string().trim().min(2).max(120),
  attributionLine: z.string().trim().min(4).max(180),
  heroEyebrow: z.string().trim().min(2).max(120),
  heroTitle: z.string().trim().min(2).max(160),
  heroAccent: z.string().trim().min(2).max(80),
  heroCopy: z.string().trim().min(20).max(600),
  membershipLabel: z.string().trim().min(2).max(120),
  showEarlyCircle: z.boolean(),
  showSafetyPanel: z.boolean(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;

export const defaultSiteSettings: SiteSettingsInput = {
  brandName: "Creator Hub",
  attributionLine: "Developing · designed by AXIOM-HIVE TECHNOLOGY",
  heroEyebrow: "Private creative membership",
  heroTitle: "Enter the",
  heroAccent: "inner circle.",
  heroCopy: "A considered place for independent creators to host live rooms, share paid work, and connect with members through clear, intentional access.",
  membershipLabel: "Private creative membership",
  showEarlyCircle: true,
  showSafetyPanel: true,
};

export function toPublicSiteSettings(row?: Partial<SiteSettingsInput> | null): SiteSettingsInput {
  return {
    brandName: row?.brandName || defaultSiteSettings.brandName,
    attributionLine: row?.attributionLine || defaultSiteSettings.attributionLine,
    heroEyebrow: row?.heroEyebrow || defaultSiteSettings.heroEyebrow,
    heroTitle: row?.heroTitle || defaultSiteSettings.heroTitle,
    heroAccent: row?.heroAccent || defaultSiteSettings.heroAccent,
    heroCopy: row?.heroCopy || defaultSiteSettings.heroCopy,
    membershipLabel: row?.membershipLabel || defaultSiteSettings.membershipLabel,
    showEarlyCircle: row?.showEarlyCircle ?? defaultSiteSettings.showEarlyCircle,
    showSafetyPanel: row?.showSafetyPanel ?? defaultSiteSettings.showSafetyPanel,
  };
}
