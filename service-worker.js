// Service Worker for SpàiláCPAD PWA

const CACHE_NAME = "spailacpad-v1"
const ASSETS = [
  "/",
  "/index.html",
  "/note.html",
  "/note_list.html",
  "/css/styles.css",
  "/js/app.js",
  "/js/todo.js",
  "/js/note.js",
  "/js/note-list.js",
  "/js/utils.js",
  "/manifest.json",
  "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap",
]

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME
            })
            .map((cacheName) => {
              return caches.delete(cacheName)
            }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response
      }

      // Clone the request
      const fetchRequest = event.request.clone()

      // Make network request
      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        // Cache the response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

// Handle push notifications
self.addEventListener("push", (event) => {
  const title = "SpàiláCPAD"
  const options = {
    body: event.data.text(),
    icon: "images/icons/icon-192x192.png",
    badge: "images/icons/icon-192x192.png",
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow("/"))
})

