const CACHE_VERSION = "tracecam-v5";

const isDev = ["localhost", "127.0.0.1", "[::1]"].includes(
  self.location.hostname,
);

const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg",
  "/css/style.css",
  "/js/main.js",
  "/js/state.js",
  "/js/dom.js",
  "/js/overlay.js",
  "/js/sketch.js",
  "/js/image.js",
  "/js/snapshot.js",
  "/js/camera.js",
  "/js/gestures.js",
  "/js/controls.js",
  "/js/sliders.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k)),
      )
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).pathname.startsWith("/api/")) return;

  if (new URL(e.request.url).origin !== self.location.origin) return;

  if (isDev) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(async () => (await caches.match(e.request)) ?? Response.error()),
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;

      return fetch(e.request).then((res) => {
        if (res.ok && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(e.request, clone));
        }
        return res;
      });
    }),
  );
});
