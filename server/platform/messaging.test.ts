import { describe, expect, it } from "vitest";
import { canOpenConversation, isConversationParticipant } from "./messaging";

describe("member messaging policy", () => {
  it("requires Premium Access and creator policy eligibility to open a conversation", () => {
    expect(canOpenConversation({ hasPremiumAccess: true, hasCreatorMembership: false, isBlocked: false, policy: "premium_members" })).toBe(true);
    expect(canOpenConversation({ hasPremiumAccess: true, hasCreatorMembership: false, isBlocked: false, policy: "creator_members" })).toBe(false);
    expect(canOpenConversation({ hasPremiumAccess: true, hasCreatorMembership: true, isBlocked: false, policy: "creator_members" })).toBe(true);
    expect(canOpenConversation({ hasPremiumAccess: false, hasCreatorMembership: true, isBlocked: false, policy: "premium_members" })).toBe(false);
    expect(canOpenConversation({ hasPremiumAccess: true, hasCreatorMembership: true, isBlocked: true, policy: "premium_members" })).toBe(false);
  });

  it("permits only the fan or creator owner to participate in a conversation", () => {
    expect(isConversationParticipant({ userId: 4, fanId: 4, creatorUserId: 8 })).toBe(true);
    expect(isConversationParticipant({ userId: 8, fanId: 4, creatorUserId: 8 })).toBe(true);
    expect(isConversationParticipant({ userId: 12, fanId: 4, creatorUserId: 8 })).toBe(false);
  });
});
