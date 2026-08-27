export const ACCEPTED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"] as const;
export const MAX_MEDIA_BYTES = 250 * 1024 * 1024;

export function isAcceptedMediaType(contentType: string): contentType is (typeof ACCEPTED_MEDIA_TYPES)[number] {
  return (ACCEPTED_MEDIA_TYPES as readonly string[]).includes(contentType);
}

export function isAcceptedMediaSize(byteSize: number) {
  return Number.isInteger(byteSize) && byteSize > 0 && byteSize <= MAX_MEDIA_BYTES;
}

export function safeMediaFilename(filename: string) {
  const normalized = filename
    .replaceAll("..", "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.slice(0, 120) || "upload.bin";
}
