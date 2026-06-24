const CACHE = "cut-v25";
const SHELL = ["./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = e.request.url;
  // Ne jamais mettre en cache les appels API (Supabase, OpenFoodFacts) : toujours réseau
  if (url.includes("supabase") || url.includes("openfoodfacts") || url.includes("esm.sh")) return;
  // Network-first : l'app est toujours à jour, le cache ne sert qu'en mode hors-ligne
  // Réseau d'abord avec délai max 3,5 s, sinon cache → jamais de gel au lancement
  e.respondWith((async () => {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 3500);
      const r = await fetch(e.request, { signal: ctl.signal });
      clearTimeout(t);
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    } catch (_) {
      const cached = await caches.match(e.request);
      if (cached) return cached;
      return fetch(e.request);
    }
  })());
});

self.addEventListener("push", e => {
  let d = {};
  try{ d = e.data.json(); }catch(_){ d = { title: "Cut · Suivi", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Cut · Suivi", { body: d.body || "", icon: "icon-192.png", badge: "icon-192.png" }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for(const c of list){ if(c.url.includes("cut-suivi") && "focus" in c) return c.focus(); }
    return clients.openWindow("./");
  }));
});
