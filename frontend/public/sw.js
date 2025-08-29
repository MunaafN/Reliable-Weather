const CACHE_NAME = 'weather-app-v1';
const ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
});

// Network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const isAPI = request.url.includes('/api/');
  if (isAPI) {
    event.respondWith(
      fetch(request).then((response) => {
        return response;
      }).catch(() => caches.match(request))
    );
  } else {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});


