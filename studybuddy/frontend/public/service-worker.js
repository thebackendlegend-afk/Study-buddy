const STATIC_CACHE = 'studybuddy-static-v1';
const DYNAMIC_CACHE = 'studybuddy-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API requests
  if (url.pathname.startsWith('/api/')) return;

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') return;

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      caches.match('/index.html')
        .then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              // Cache successful navigation responses
              if (networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // Return cached version if network fails
              return cachedResponse || caches.match('/index.html');
            });

          // Return cached version immediately, then update in background
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // Handle other requests (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          });

        // Return cached version or fetch
        return cachedResponse || fetchPromise;
      })
  );
});
