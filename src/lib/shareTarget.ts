// Must match public/sw.js — the service worker stashes a shared file (from
// Android's share sheet) in this cache/key, and we pick it up here on load.
const CACHE_VERSION = "expense-tracker-v1";
const SHARED_FILE_KEY = "/__shared-file";

export async function consumeSharedFile(): Promise<File | null> {
  if (typeof caches === "undefined") return null;
  const cache = await caches.open(CACHE_VERSION);
  const response = await cache.match(SHARED_FILE_KEY);
  if (!response) return null;
  await cache.delete(SHARED_FILE_KEY);
  const blob = await response.blob();
  return new File([blob], "shared-file", { type: blob.type });
}
