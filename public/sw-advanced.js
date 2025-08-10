// Advanced Service Worker for Hjemmeinventar
// Provides offline support, background sync, and intelligent caching

const CACHE_NAME = 'hjemmeinventar-v2.0'
const RUNTIME_CACHE = 'hjemmeinventar-runtime'
const PRECACHE_NAME = 'hjemmeinventar-precache'
const DATA_CACHE = 'hjemmeinventar-data'
const IMAGE_CACHE = 'hjemmeinventar-images'

// Files to precache for offline functionality
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/items',
  '/locations',
  '/categories',
  '/offline',
  '/manifest.json',
  // Add critical CSS and JS files
  '/_next/static/css/app.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js'
]

// Network timeout for fetch requests
const NETWORK_TIMEOUT = 3000

// Install event - precache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing advanced service worker...')
  
  event.waitUntil(
    Promise.all([
      // Precache essential files
      caches.open(PRECACHE_NAME).then(cache => {
        return cache.addAll(PRECACHE_URLS)
      }),
      // Initialize data cache
      caches.open(DATA_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(RUNTIME_CACHE)
    ]).then(() => {
      console.log('[SW] Precaching completed')
      return self.skipWaiting()
    })
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating advanced service worker...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('hjemmeinventar-') && 
                     ![CACHE_NAME, PRECACHE_NAME, DATA_CACHE, IMAGE_CACHE, RUNTIME_CACHE].includes(cacheName)
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // Take control of all pages immediately
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Advanced service worker activated')
    })
  )
})

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Skip requests to other origins (except for APIs we control)
  if (url.origin !== self.location.origin && !isAllowedExternalOrigin(url.origin)) {
    return
  }

  event.respondWith(handleFetch(request))
})

async function handleFetch(request) {
  const url = new URL(request.url)
  
  try {
    // API requests - Network First with intelligent fallback
    if (isAPIRequest(url)) {
      return await handleAPIRequest(request)
    }
    
    // Images - Cache First with network fallback
    if (isImageRequest(url)) {
      return await handleImageRequest(request)
    }
    
    // Static assets - Cache First
    if (isStaticAsset(url)) {
      return await handleStaticAsset(request)
    }
    
    // Navigation requests - Network First with offline fallback
    if (request.mode === 'navigate') {
      return await handleNavigationRequest(request)
    }
    
    // Default: Network First
    return await networkFirst(request, RUNTIME_CACHE)
    
  } catch (error) {
    console.error('[SW] Fetch failed:', error)
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline')
    }
    
    // Return cached response or throw error
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// API Request Handler - Network First with offline queue
async function handleAPIRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first with timeout
    const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT)
    
    // Cache successful responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DATA_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[SW] Network failed for API request, checking cache')
    
    // For GET requests, try cache
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        console.log('[SW] Serving API request from cache')
        return cachedResponse
      }
    }
    
    // For POST/PUT/DELETE, queue for background sync
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      await queueBackgroundSync(request)
      return new Response(JSON.stringify({ 
        offline: true, 
        queued: true,
        message: 'Request queued for sync when online' 
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    throw error
  }
}

// Image Request Handler - Cache First
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Return placeholder image for failed image loads
    return new Response(getPlaceholderImageData(), {
      headers: { 'Content-Type': 'image/png' }
    })
  }
}

// Static Asset Handler - Cache First with long expiry
async function handleStaticAsset(request) {
  const cache = await caches.open(PRECACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone())
  }
  
  return networkResponse
}

// Navigation Request Handler - Network First with offline page
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT)
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[SW] Network failed for navigation, checking cache')
    
    // Try cached version
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    const offlinePage = await caches.match('/offline')
    if (offlinePage) {
      return offlinePage
    }
    
    // Fallback offline response
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Hjemmeinventar</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
            .offline-icon { font-size: 64px; margin-bottom: 20px; }
            .offline-title { color: #333; margin-bottom: 10px; }
            .offline-message { color: #666; margin-bottom: 30px; }
            .retry-button { 
              background: #007bff; color: white; border: none; 
              padding: 12px 24px; border-radius: 6px; cursor: pointer; 
            }
          </style>
        </head>
        <body>
          <div class="offline-icon">📱</div>
          <h1 class="offline-title">Du er offline</h1>
          <p class="offline-message">Sjekk internetttilkoblingen din og prøv igjen.</p>
          <button class="retry-button" onclick="window.location.reload()">Prøv igjen</button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Network First strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Utility functions
function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Fetch timeout')), timeout)
    )
  ])
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.pathname.startsWith('/trpc/')
}

function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.startsWith('/static/') ||
         /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname)
}

function isAllowedExternalOrigin(origin) {
  const allowedOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.hjemmeinventar.no' // Your API domain if external
  ]
  return allowedOrigins.includes(origin)
}

function getPlaceholderImageData() {
  // Returns a simple 1x1 transparent PNG
  return new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ])
}

// Background Sync for offline actions
async function queueBackgroundSync(request) {
  try {
    // Store request for background sync
    const db = await openIndexedDB()
    const transaction = db.transaction(['sync_queue'], 'readwrite')
    const store = transaction.objectStore('sync_queue')
    
    const syncItem = {
      id: Date.now() + Math.random(),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now()
    }
    
    await store.add(syncItem)
    console.log('[SW] Queued request for background sync:', syncItem)
    
    // Register for background sync
    if ('serviceWorker' in self && 'sync' in self.ServiceWorkerRegistration.prototype) {
      await self.registration.sync.register('hjemmeinventar-sync')
    }
    
  } catch (error) {
    console.error('[SW] Failed to queue background sync:', error)
  }
}

// Background Sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'hjemmeinventar-sync') {
    event.waitUntil(processSyncQueue())
  }
})

async function processSyncQueue() {
  try {
    const db = await openIndexedDB()
    const transaction = db.transaction(['sync_queue'], 'readwrite')
    const store = transaction.objectStore('sync_queue')
    const items = await store.getAll()
    
    console.log(`[SW] Processing ${items.length} queued sync items`)
    
    for (const item of items) {
      try {
        const request = new Request(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        })
        
        const response = await fetch(request)
        
        if (response.ok) {
          await store.delete(item.id)
          console.log('[SW] Successfully synced queued request:', item.url)
        } else {
          console.warn('[SW] Sync failed with status:', response.status, item.url)
        }
        
      } catch (error) {
        console.error('[SW] Failed to sync request:', error, item.url)
      }
    }
    
  } catch (error) {
    console.error('[SW] Background sync processing failed:', error)
  }
}

// IndexedDB helper
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hjemmeinventar-sw', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('sync_queue')) {
        const store = db.createObjectStore('sync_queue', { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp')
      }
    }
  })
}

// Push notification handling (existing functionality)
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
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Hjemmeinventar', options)
  )
})

// Notification click handling (existing functionality)
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
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'hjemmeinventar-periodic-sync') {
    event.waitUntil(performPeriodicSync())
  }
})

async function performPeriodicSync() {
  console.log('[SW] Performing periodic sync...')
  
  try {
    // Sync any pending offline actions
    await processSyncQueue()
    
    // Update critical cached data
    await updateCriticalCache()
    
    // Clean up old cache entries
    await cleanupOldCacheEntries()
    
  } catch (error) {
    console.error('[SW] Periodic sync failed:', error)
  }
}

async function updateCriticalCache() {
  // Update dashboard data and other critical information
  const criticalUrls = [
    '/api/trpc/items.getStats',
    '/api/trpc/activities.getRecent',
    '/api/trpc/locations.getAll'
  ]
  
  for (const url of criticalUrls) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        const cache = await caches.open(DATA_CACHE)
        await cache.put(url, response)
      }
    } catch (error) {
      console.warn('[SW] Failed to update critical cache for:', url)
    }
  }
}

async function cleanupOldCacheEntries() {
  const cacheNames = [DATA_CACHE, IMAGE_CACHE, RUNTIME_CACHE]
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
  const cutoff = Date.now() - maxAge
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      
      for (const request of requests) {
        const response = await cache.match(request)
        const dateHeader = response.headers.get('date')
        
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime()
          if (responseDate < cutoff) {
            await cache.delete(request)
          }
        }
      }
    } catch (error) {
      console.warn('[SW] Cache cleanup failed for:', cacheName)
    }
  }
}

console.log('[SW] Advanced Service Worker loaded successfully')
