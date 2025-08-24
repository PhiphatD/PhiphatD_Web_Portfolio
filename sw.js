/* Lightweight service worker for offline stability and runtime caching */
const CACHE_NAME = 'pd-portfolio-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './slideshow.js',
  './certificate-renderer.js',
  './certificates-data.json',
  './icons/portfolio-logo.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

function cacheFirst(request) {
  return caches.match(request).then(cached => {
    return cached || fetch(request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return resp;
    });
  });
}

function networkFirst(request) {
  return fetch(request).then(resp => {
    const copy = resp.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    return resp;
  }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')));
}

function staleWhileRevalidate(request) {
  return caches.match(request).then(cached => {
    const networkFetch = fetch(request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return resp;
    }).catch(() => cached);
    return cached || networkFetch;
  });
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET
  if (request.method !== 'GET') return;

  // External CDNs: Google Fonts and Unicons
  if (
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com') ||
    url.origin.includes('unicons.iconscout.com')
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Same-origin strategies
  if (url.origin === self.location.origin) {
    // HTML navigations -> network first with offline fallback
    if (request.mode === 'navigate' || request.destination === 'document') {
      event.respondWith(networkFirst(request));
      return;
    }

    // Images -> cache first (exclude PDFs)
    if (/\.(png|jpe?g|webp|svg|gif)$/i.test(url.pathname)) {
      event.respondWith(cacheFirst(request));
      return;
    }

    // JSON/data -> network first
    if (/\.(json)$/i.test(url.pathname)) {
      event.respondWith(networkFirst(request));
      return;
    }

    // CSS/JS -> stale-while-revalidate
    if (/\.(css|js)$/i.test(url.pathname)) {
      event.respondWith(staleWhileRevalidate(request));
      return;
    }
  }
});