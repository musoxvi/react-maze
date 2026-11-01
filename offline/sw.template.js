/* Service worker for offline play. Generated at build time by vite.config.ts,
   which fills in the cache version and the list of built files. */
const CACHE = "maze-__VERSION__";
const PRECACHE = __PRECACHE__;
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
// Servers may send "Vary: Origin"; module scripts carry an Origin header, so
// without this the precached files would never match
const MATCH = { ignoreVary: true };

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const putInCache = async (request, response) => {
  if (response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only plain GETs; skip video (range requests) and the scores API
  if (request.method !== "GET" || request.headers.has("range") || url.pathname.endsWith(".mov")) return;

  // Pages: network first so updates arrive, cached app when offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => putInCache("/index.html", response))
        .catch(() => caches.match("/index.html", MATCH))
    );
    return;
  }

  // Built assets have hashed names, so the cached copy is always valid
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request, MATCH).then((cached) => cached || fetch(request).then((r) => putInCache(request, r)))
    );
    return;
  }

  // Fonts: serve cached copy, refresh it in the background
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(request, MATCH).then((cached) => {
        const network = fetch(request)
          .then((r) => putInCache(request, r))
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
