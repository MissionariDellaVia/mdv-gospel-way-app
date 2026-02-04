/* eslint-disable no-restricted-globals */
// Immediately take control on install/activate
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', evt => {
    evt.waitUntil(self.clients.claim())
})

// Network‑first with cache fallback
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' ||
        !event.request.url.startsWith(self.location.origin)) {
        return
    }
    event.respondWith(
        fetch(event.request)
            .then(res => {
                if (res.ok) {
                    // Cache a copy
                    const clone = res.clone()
                    caches.open('dynamic-cache').then(c => c.put(event.request, clone))
                }
                return res
            })
            .catch(() => caches.match(event.request))
    )
})