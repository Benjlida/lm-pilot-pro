const CACHE = 'lm-pilot-pro-v8';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './splash-lm-pilot-pro.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
  );

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // On ne traite que les requêtes GET
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // ==========================================================
  // 1. NAVIGATION
  // Toujours essayer Internet en premier
  // ==========================================================
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put(request, copy));

          return response;
        })
        .catch(() =>
          caches.match(request)
            .then(response =>
              response || caches.match('./offline.html')
            )
        )
    );

    return;
  }

  // ==========================================================
  // 2. FICHIERS DE L'APPLICATION GITHUB PAGES
  // Cache + mise à jour depuis Internet
  // ==========================================================
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {

          const networkResponse = fetch(request)
            .then(response => {

              if (
                response &&
                response.status === 200 &&
                response.type === 'basic'
              ) {
                const copy = response.clone();

                caches.open(CACHE)
                  .then(cache => cache.put(request, copy));
              }

              return response;
            })
            .catch(() => cachedResponse);

          return cachedResponse || networkResponse;
        })
    );

    return;
  }

  // ==========================================================
  // 3. APPS SCRIPT ET CONTENUS EXTERNES
  // Réseau en priorité
  // ==========================================================
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});
