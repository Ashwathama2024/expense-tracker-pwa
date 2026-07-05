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
  }, []);

  return null;
}
