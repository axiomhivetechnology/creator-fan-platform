import { describe, expect, it } from "vitest";
import { creators } from "./catalog";

describe("featured creator catalog metadata", () => {
  it("keeps Kaden McCullen's confirmed Instagram handle attached to the featured creator", () => {
    const featured = creators.find(creator => creator.handle === "kaden-mccullen");

    expect(featured?.displayName).toBe("Kaden McCullen");
    expect(featured?.instagramHandle).toBe("@itskadenbro");
  });
});
