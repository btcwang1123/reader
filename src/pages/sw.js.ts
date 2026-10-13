import type { APIRoute } from 'astro';

export const prerender = true;

/**
 * Service worker(PWA 離線瀏覽)
 * - 頁面:網路優先,離線時用快取,都沒有就顯示首頁
 * - 圖片、CSS、JS 等靜態資源:快取優先,背景更新
 * 每次建置的 VERSION 不同,舊快取會在啟用時清掉
 */
export const GET: APIRoute = () => {
  const BASE = import.meta.env.BASE_URL;
  const VERSION = Date.now().toString(36);
  const PRECACHE = ['', 'books/', 'quotes/', 'stats/', 'offline/'].map((path) => `${BASE}${path}`);

  const code = `const CACHE = 'reader-${VERSION}';
const PRECACHE = ${JSON.stringify(PRECACHE)};
const OFFLINE = ${JSON.stringify(`${BASE}offline/`)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('reader-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match(OFFLINE)))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
`;
  return new Response(code, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
};
