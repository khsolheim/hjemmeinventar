// Service Worker for push notifications og offline caching

const CACHE_NAME = 'hjemmeinventar-v1'
const OFFLINE_URL = '/offline'

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body || 'Du har en ny varsling',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    tag: data.tag || 'hjemmeinventar-notification',
    data: data.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Hjemmeinventar', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data
  let url = '/'

  if (data.type === 'EXPIRY_REMINDER') {
    url = '/items?filter=expiring'
  } else if (data.type === 'LOAN_OVERDUE') {
    url = '/loans?filter=overdue'
  } else if (data.url) {
    url = data.url
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})