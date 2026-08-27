import { describe, expect, it } from "vitest";
import { isAcceptedMediaSize, isAcceptedMediaType, MAX_MEDIA_BYTES, safeMediaFilename } from "./media";

describe("creator media constraints", () => {
  it("accepts only reviewed image and video types within the upload limit", () => {
    expect(isAcceptedMediaType("image/jpeg")).toBe(true);
    expect(isAcceptedMediaType("video/mp4")).toBe(true);
    expect(isAcceptedMediaType("application/pdf")).toBe(false);
    expect(isAcceptedMediaSize(MAX_MEDIA_BYTES)).toBe(true);
    expect(isAcceptedMediaSize(MAX_MEDIA_BYTES + 1)).toBe(false);
  });

  it("normalizes filenames before they become storage-key segments", () => {
    expect(safeMediaFilename("Studio Image (Final).JPG")).toBe("studio-image-final-.jpg");
    expect(safeMediaFilename("../../private")).toBe("private");
  });
});
