"use client";

import { useEffect } from "react";

// Must match next.config.ts's basePath so this resolves under a GitHub Pages
// project subpath (e.g. /repo-name/sw.js) instead of 404ing at domain root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {
        // Offline caching is best-effort; ignore registration failures.
      });
    }

    // Without this, Chrome treats the site's storage (including all the
    // IndexedDB expense data) as evictable under disk pressure, same as any
    // other tab's cache — it can be wiped with no warning. Requesting
    // "persisted" storage opts this origin out of that automatic eviction.
    if (navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {
        // Best-effort — some browsers/contexts reject this; nothing to do.
      });
    }
  }, []);

  return null;
}
