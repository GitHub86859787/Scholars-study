// Chronicle Map — Service Worker
// Strategy: network-first for HTML/JSON so updates show immediately when online;
// falls back to cache when offline (e.g. on a plane). Images are cache-first
// since map art never changes.

const CACHE_VERSION = 'chronicle-v1';
const PRECACHE_URLS = [
  './',
  'history.html',
  'manifest.json',
  'us.json',
  'es.json',
  'pt.json',
  'ir.json',
  'glossary.json',
  'images/map_prehistoric.png',
  'images/map_3000bce.png',
  'images/map_500bce.png',
  'images/map_200ce.png',
  'images/map_1000ce.png',
  'images/map_1400ce.png',
  'images/map_1800ce.png',
  'images/map_modern.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Cache each individually so one missing file doesn't fail the whole install
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => console.log('[SW] Skip caching', url, err))
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let external requests (fonts, etc.) pass through normally

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        // Got a fresh copy — update the cache for offline use later
        const clone = networkRes.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
        return networkRes;
      })
      .catch(() => {
        // Offline or request failed — serve from cache
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          // Last resort for navigations: serve the app shell
          if (req.mode === 'navigate') return caches.match('history.html');
          return new Response('', { status: 504, statusText: 'Offline' });
        });
      })
  );
});
