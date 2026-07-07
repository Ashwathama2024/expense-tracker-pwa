// Minimal hand-rolled service worker (manual, per project spec — no next-pwa
// dependency). Caches the app shell for offline use after first visit.
//
// Bump this string whenever you need to force every client to drop its old
// cache (e.g. after this fix, which changed the caching strategy itself).
const CACHE_VERSION = "expense-tracker-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Web Share Target: Android's share sheet POSTs the shared file here. There's
// no server (static export), so this intercepts the POST entirely client-side,
// stashes the file in the versioned cache, and redirects to the app, which
// picks it up and runs it through the same receipt-scan flow as a manual pick.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname.endsWith("/share-target")) {
    event.respondWith(
      (async () => {
        const formData = await request.formData();
        const file = formData.get("file");
        if (file) {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put("/__shared-file", new Response(file));
        }
        return Response.redirect("./?shared=1", 303);
      })()
    );
    return;
  }

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Next.js's own JS/CSS chunks are content-hashed (the filename changes
  // whenever the content does), so a cached copy is never stale — safe to
  // serve cache-first and only hit the network on a cache miss.
  const isHashedAsset = url.pathname.includes("/_next/static/");
  if (isHashedAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Everything else (HTML pages, manifest.json, /icons/*, sw.js) keeps the
  // *same* URL across deploys while its content changes — so it must always
  // be network-first, falling back to a cached copy only when actually
  // offline. Serving these cache-first (the old behavior) meant a changed
  // icon or manifest could stay stuck behind a stale cached copy forever.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
  );
});
