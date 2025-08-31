// Offline service for PWA functionality
import { toast } from 'sonner'

interface OfflineQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  data: any
  endpoint: string
  timestamp: number
  retries: number
}

class OfflineService {
  private queue: OfflineQueueItem[] = []
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true
  private syncInProgress: boolean = false
  private initialized: boolean = false

  constructor() {
    this.loadQueueFromStorage()
  }

  private initialize() {
    if (this.initialized || typeof window === 'undefined') {
      return
    }

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))

    // Listen for page visibility changes to sync when user returns
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))

    // Initial online status
    this.isOnline = navigator.onLine
    this.initialized = true
  }

  private handleOnline() {
    this.isOnline = true
    toast.success('Tilkobling gjenopprettet - synkroniserer data...')
    this.syncQueue()
  }

  private handleOffline() {
    this.isOnline = false
    toast.warning('Du er offline - endringer lagres lokalt')
  }

  private handleVisibilityChange() {
    if (document.visibilityState === 'visible' && this.isOnline && this.queue.length > 0) {
      this.syncQueue()
    }
  }

  // Add operation to offline queue
  async addToQueue(type: 'create' | 'update' | 'delete', data: any, endpoint: string): Promise<string> {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)

    const queueItem: OfflineQueueItem = {
      id,
      type,
      data,
      endpoint,
      timestamp: Date.now(),
      retries: 0
    }

    this.queue.push(queueItem)
    this.saveQueueToStorage()

    if (!this.isOnline) {
      toast.info('Lagt til i kø for senere synkronisering')
    }

    return id
  }

  // Sync queue when online
  private async syncQueue() {
    if (this.syncInProgress || this.queue.length === 0 || !this.isOnline) {
      return
    }

    this.syncInProgress = true
    const queueToProcess = [...this.queue]

    try {
      for (const item of queueToProcess) {
        try {
          await this.processQueueItem(item)
          this.removeFromQueue(item.id)
        } catch (error) {
          console.error('Failed to sync item:', item.id, error)
          item.retries++

          // Remove item if it has failed too many times
          if (item.retries >= 3) {
            this.removeFromQueue(item.id)
            toast.error(`Kunne ikke synkronisere endring etter ${item.retries} forsøk`)
          }
        }
      }

      if (queueToProcess.length > 0) {
        const syncedCount = queueToProcess.length - this.queue.length
        if (syncedCount > 0) {
          toast.success(`Synkronisert ${syncedCount} endringer`)
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  private async processQueueItem(item: OfflineQueueItem) {
    // This would typically make API calls to sync data
    // For now, we'll simulate the sync process
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate API call
        if (Math.random() > 0.1) { // 90% success rate
          resolve(true)
        } else {
          reject(new Error('Sync failed'))
        }
      }, 1000)
    })
  }

  private removeFromQueue(id: string) {
    this.queue = this.queue.filter(item => item.id !== id)
    this.saveQueueToStorage()
  }

  private saveQueueToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hms-offline-queue', JSON.stringify(this.queue))
    }
  }

  private loadQueueFromStorage() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hms-offline-queue')
      if (stored) {
        try {
          this.queue = JSON.parse(stored)
        } catch (error) {
          console.error('Failed to load offline queue:', error)
          this.queue = []
        }
      }
    }
  }

  // Public methods
  isOffline(): boolean {
    return !this.isOnline
  }

  getQueueLength(): number {
    return this.queue.length
  }

  getQueueItems(): OfflineQueueItem[] {
    return [...this.queue]
  }

  // Force sync
  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncQueue()
    } else {
      toast.warning('Kan ikke synkronisere når offline')
    }
  }

  // Clean up old items (older than 7 days)
  cleanupOldItems() {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    this.queue = this.queue.filter(item => item.timestamp > sevenDaysAgo)
    this.saveQueueToStorage()
  }

  // Initialize on client side
  initClientSide() {
    this.initialize()
  }

  // Destroy service
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this))
      window.removeEventListener('offline', this.handleOffline.bind(this))
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    }
  }
}

// Create singleton instance
export const offlineService = new OfflineService()

// Hook for using offline service in React components
export function useOfflineService() {
  return {
    isOffline: offlineService.isOffline(),
    queueLength: offlineService.getQueueLength(),
    queueItems: offlineService.getQueueItems(),
    forceSync: offlineService.forceSync.bind(offlineService),
    addToQueue: offlineService.addToQueue.bind(offlineService)
  }
}

// Background sync utility
export class BackgroundSync {
  private registration: ServiceWorkerRegistration | null = null

  async register() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        this.registration = await navigator.serviceWorker.ready

        // Register background sync
        await this.registration.sync.register('background-sync')

        console.log('Background sync registered')
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }
  }

  async unregister() {
    if (this.registration) {
      try {
        await this.registration.sync.unregister('background-sync')
        console.log('Background sync unregistered')
      } catch (error) {
        console.error('Background sync unregistration failed:', error)
      }
    }
  }
}

export const backgroundSync = new BackgroundSync()
