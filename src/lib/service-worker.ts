// Service Worker Registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw-offline.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope)

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('New service worker version available')

                  // Notify user about update (could show a toast)
                  if (window.confirm('En ny versjon av appen er tilgjengelig. Vil du laste den inn nå?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                    window.location.reload()
                  }
                }
              })
            }
          })

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data) {
              if (event.data.type === 'SYNC_COMPLETE') {
                console.log('Background sync completed:', event.data.message)
                // Could show a success toast here
              } else if (event.data.type === 'SYNC_FAILED') {
                console.error('Background sync failed:', event.data.message)
                // Could show an error toast here
              }
            }
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    })
  }
}

// Unregister service worker (for development/testing)
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister().then((success) => {
        if (success) {
          console.log('Service Worker unregistered successfully')
        }
      })
    })
  }
}
