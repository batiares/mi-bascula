// Cambia la versión al publicar cambios para que los celulares descarguen lo nuevo.
const CACHE = "mbd-v1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const save = res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; };
  // la página: red primero (para recibir actualizaciones), caché si no hay internet
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(save).catch(() => caches.match("./index.html")));
    return;
  }
  // íconos y fuentes: caché primero
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(save)));
});
