const CACHE_NAME = 'ha-ludo-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(() => {
          // It's okay if some URLs fail to cache
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if(cacheName !== CACHE_NAME){
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET'){
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if(response){
          return response;
        }

        return fetch(event.request)
          .then(response => {
            if(!response || response.status !== 200 || response.type === 'basic' && !event.request.url.includes('google') && !event.request.url.includes('gstatic') && !event.request.url.includes('googleapis')){
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, response.clone());
                  return response;
                });
            }
            return response;
          })
          .catch(() => {
            return caches.match(event.request)
              .then(response => response || caches.match('/index.html'));
          });
      })
  );
});
