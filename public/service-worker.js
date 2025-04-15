// Basic service worker

// Cache name with version
const CACHE_NAME = 'gospelway-cache-v1';

// Assets to cache
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Adjust paths for GitHub Pages if needed
function adjustPaths(items) {
    if (self.location.pathname.includes('/mdv-gospel-way-app/')) {
        return items.map(item => {
            if (item === '/') return '/mdv-gospel-way-app/';
            return '/mdv-gospel-way-app' + item;
        });
    }
    return items;
}

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service worker installed - opening cache');
                return cache.addAll(adjustPaths(urlsToCache));
            })
    );
    // Force activation
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Claim clients
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // Try to get from cache if network fails
                return caches.match(event.request);
            })
    );
});

// Handle skip waiting message
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Service worker loaded successfully');