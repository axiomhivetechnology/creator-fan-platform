export type CreatorMessagePolicy = "premium_members" | "creator_members" | "disabled";

export function canOpenConversation(input: { hasPremiumAccess: boolean; hasCreatorMembership: boolean; isBlocked: boolean; policy: CreatorMessagePolicy }) {
  if (!input.hasPremiumAccess || input.isBlocked || input.policy === "disabled") return false;
  return input.policy === "premium_members" || input.hasCreatorMembership;
}

export function isConversationParticipant(input: { userId: number; fanId: number; creatorUserId: number }) {
  return input.userId === input.fanId || input.userId === input.creatorUserId;
}
