const CACHE = 'lm-pilot-pro-v3';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './hors ligne.html',
  './icône-192.png',
  './icône-512.png',
  './icône-masquable-512.png',
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

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Navigation : toujours chercher la version la plus récente sur Internet
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
              response || caches.match('./hors ligne.html')
            )
        )
    );

    return;
  }

  // Fichiers GitHub Pages
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

  // Apps Script et contenus externes : réseau uniquement
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});
