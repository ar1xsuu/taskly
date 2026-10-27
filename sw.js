// TASKLY service worker: keeps the app shell available offline.
// Bump VERSION when you change files that must be re-downloaded (fonts, vendor, icons).
const VERSION = 'taskly-v1';
const CORE = [
  "./",
  "index.html",
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
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); } return res; })));
});
