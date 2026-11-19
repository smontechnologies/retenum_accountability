/*
 * Retenum service worker (TD-24, PWA-02/05/07).
 * - Cache-first ONLY for versioned static assets (/_next/static/*) and generated icons.
 * - Everything else (pages, server actions, API, auth) goes to the network. Authenticated pages and
 *   financial data are never cached. Non-GET requests are never touched, so nothing is queued or replayed.
 * - Failed page navigations show the cached /offline page.
 * - A new version waits until the user chooses "Reload to update" (SKIP_WAITING message).
 */
const VERSION = "retenum-v2";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL, "/icons/icon-192.png"])));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

function isCacheableStatic(url) {
  return url.origin === self.location.origin && (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/"));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return; // never intercept actions or mutations
  const url = new URL(request.url);

  if (isCacheableStatic(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || new Response("You're offline.", { status: 503, headers: { "content-type": "text/plain" } })),
    );
  }
  // All other GETs: default network behaviour, no caching.
});
