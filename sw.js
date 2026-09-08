const CACHE = "iob-qr-dark-v2";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.endsWith("/index.html") || url.pathname.endsWith("/")) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: "no-store" });
        const copy = fresh.clone();
        const cache = await caches.open(CACHE);
        await cache.put("./index.html", copy);
        return fresh;
      } catch (e) {
        return (await caches.match(req)) || (await caches.match("./index.html"));
      }
    })());
    return;
  }
  event.respondWith(caches.match(req).then(r => r || fetch(req)));
});
