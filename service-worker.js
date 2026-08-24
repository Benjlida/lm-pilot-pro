const CACHE = 'lm-pilot-pro-v2';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

/* ============================================================
   INSTALLATION
   - Création du nouveau cache V2
   - Mise en cache de la coque de l'application
   - Activation immédiate du nouveau service worker
   ============================================================ */
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(SHELL))
  );

  self.skipWaiting();
});


/* ============================================================
   ACTIVATION
   - Suppression automatique des anciens caches
   - Le nouveau service worker prend immédiatement le contrôle
   ============================================================ */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
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


/* ============================================================
   FETCH
   ============================================================ */
self.addEventListener('fetch', event => {
  const request = event.request;

  // Ne gérer que les requêtes GET.
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);


  /* ----------------------------------------------------------
     NAVIGATION / PAGES HTML
     Toujours essayer Internet en premier.

     Très important :
     cela permet de récupérer le nouveau index.html
     et donc la nouvelle URL Apps Script.
     ---------------------------------------------------------- */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copie = response.clone();

          caches
            .open(CACHE)
            .then(cache => cache.put(request, copie));

          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then(response => response || caches.match('./offline.html'))
        )
    );

    return;
  }


  /* ----------------------------------------------------------
     FICHIERS DU SITE GITHUB
     Cache d'abord + actualisation en arrière-plan.
     ---------------------------------------------------------- */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        const networkResponse = fetch(request)
          .then(response => {
            if (
              response &&
              response.status === 200 &&
              response.type === 'basic'
            ) {
              const copie = response.clone();

              caches
                .open(CACHE)
                .then(cache => cache.put(request, copie));
            }

            return response;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkResponse;
      })
    );

    return;
  }


  /* ----------------------------------------------------------
     URL EXTERNE, notamment Google Apps Script.
     Toujours utiliser le réseau.
     On ne met PAS Apps Script en cache.
     ---------------------------------------------------------- */
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
