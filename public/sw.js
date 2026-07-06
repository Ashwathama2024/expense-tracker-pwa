// Minimal hand-rolled service worker (manual, per project spec — no next-pwa
// dependency). Caches the app shell for offline use after first visit.
const CACHE_VERSION = "expense-tracker-v1";

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

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
