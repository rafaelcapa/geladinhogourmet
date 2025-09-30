self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("geladinho-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "/icon.png",
        "/pwa-icon.png",
        "/QRCode.png"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
