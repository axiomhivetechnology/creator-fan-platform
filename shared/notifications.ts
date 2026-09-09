import { z } from "zod";

export const notificationSeverities = ["info", "success", "warning", "urgent"] as const;
export const notificationAudiences = ["everyone", "fans", "creators", "staff", "admins"] as const;

export const notificationInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(2).max(1000),
  severity: z.enum(notificationSeverities),
  audience: z.enum(notificationAudiences),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().default(true),
}).superRefine((value, context) => {
  if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "End time must follow start time." });
  }
});

export type NotificationInput = z.infer<typeof notificationInputSchema>;
export type NotificationAudience = (typeof notificationAudiences)[number];

export function canViewNotification(audience: NotificationAudience, role?: string | null) {
  if (audience === "everyone") return true;
  if (!role) return false;
  if (audience === "fans") return role === "fan";
  if (audience === "creators") return role === "creator";
  if (audience === "staff") return ["moderator", "finance", "admin"].includes(role);
  if (audience === "admins") return role === "admin";
  return false;
}
