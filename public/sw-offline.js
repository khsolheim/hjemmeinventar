// Service Worker for Offline Functionality and Background Sync
const CACHE_NAME = 'hms-offline-v1'
const OFFLINE_URL = '/offline'

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png'
      ])
    })
  )
  // Force activation
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Take control of all clients
  self.clients.claim()
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL).then((response) => {
          return response || caches.match('/')
        })
      })
    )
    return
  }

  // Handle other requests - try network first, then cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    })
  )
})

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineQueue())
  }
})

// Function to sync offline queue
async function syncOfflineQueue() {
  try {
    // Get stored queue from IndexedDB or similar
    // This would typically sync with your backend API
    console.log('Syncing offline queue...')

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Notify clients that sync is complete
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Offline data synced successfully'
      })
    })

    console.log('Offline sync complete')
  } catch (error) {
    console.error('Background sync failed:', error)

    // Notify clients of sync failure
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILED',
        message: 'Failed to sync offline data'
      })
    })
  }
}

// Push notification event (for future use)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)

  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Åpne app',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Lukk',
        icon: '/icon-192x192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('HMS Notification', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event)

  event.notification.close()

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
