// 网络优先 + 离线回退
// 有网 → 拿最新文件（同时更新缓存）
// 没网 → 读缓存（上次有网时存的）
const CACHE = 'scholars-study-offline';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 有网：拿到最新文件，顺手存一份到缓存
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 没网：从缓存读
        return caches.match(event.request);
      })
  );
});
