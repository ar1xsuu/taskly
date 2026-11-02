// TASKLY service worker: keeps the app shell available offline.
// Bump VERSION (and the ?v= number on the icons in manifest.webmanifest) when you replace the icons, fonts or vendor files.
const VERSION = 'taskly-v2';
const CORE = [
  "./",
  "index.html",
  "config.js",
  "manifest.webmanifest",
  "vendor/supabase.js",
  "logo.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "fonts/fonts.css",
  "fonts/figtree-latin-wght-normal.woff2",
  "fonts/figtree-latin-ext-wght-normal.woff2",
  "fonts/bricolage-grotesque-latin-wght-normal.woff2",
  "fonts/bricolage-grotesque-latin-ext-wght-normal.woff2",
  "fonts/caveat-latin-wght-normal.woff2",
  "fonts/caveat-latin-ext-wght-normal.woff2"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin || u.pathname.startsWith('/api/')) return; // never touch API or Supabase traffic
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put('index.html', cp)); return res; })
      .catch(() => caches.match('index.html').then(m => m || caches.match('./'))));
    return;
  }
  // Files load from the cache instantly and are refreshed in the background, so changed icons or fonts show up on the next visit.
  e.respondWith(caches.open(VERSION).then(c => c.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit || Response.error());
    return hit || net;
  })));
});
