import { openDB, IDBPDatabase } from 'idb'

// IndexedDB Database Configuration
const DB_NAME = 'hjemmeinventar-offline'
const DB_VERSION = 1

// Object Store Names
const STORES = {
  ITEMS: 'items',
  LOCATIONS: 'locations',
  CATEGORIES: 'categories',
  ACTIVITIES: 'activities',
  OFFLINE_ACTIONS: 'offline_actions',
  SEARCH_CACHE: 'search_cache',
  SETTINGS: 'settings',
  USER_DATA: 'user_data'
} as const

export interface OfflineAction {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: 'item' | 'location' | 'category' | 'activity'
  data: any
  timestamp: Date
  retryCount: number
  maxRetries: number
  status: 'pending' | 'syncing' | 'completed' | 'failed'
  error?: string
}

export interface CachedData {
  id: string
  data: any
  timestamp: Date
  expiresAt?: Date
  version: number
}

class OfflineManager {
  private db: IDBPDatabase | null = null
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : false
  private syncInProgress = false
  private retryTimeouts = new Map<string, NodeJS.Timeout>()

  constructor() {
    // Only setup listeners in browser environment
    if (typeof window !== 'undefined') {
      this.setupOnlineListeners()
    }
  }

  // Initialize IndexedDB
  async initialize(): Promise<boolean> {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Items store
          if (!db.objectStoreNames.contains(STORES.ITEMS)) {
            const itemsStore = db.createObjectStore(STORES.ITEMS, { keyPath: 'id' })
            itemsStore.createIndex('categoryId', 'categoryId')
            itemsStore.createIndex('locationId', 'locationId')
            itemsStore.createIndex('timestamp', 'timestamp')
          }

          // Locations store
          if (!db.objectStoreNames.contains(STORES.LOCATIONS)) {
            const locationsStore = db.createObjectStore(STORES.LOCATIONS, { keyPath: 'id' })
            locationsStore.createIndex('parentId', 'parentId')
            locationsStore.createIndex('type', 'type')
          }

          // Categories store
          if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
            db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' })
          }

          // Activities store
          if (!db.objectStoreNames.contains(STORES.ACTIVITIES)) {
            const activitiesStore = db.createObjectStore(STORES.ACTIVITIES, { keyPath: 'id' })
            activitiesStore.createIndex('timestamp', 'timestamp')
            activitiesStore.createIndex('type', 'type')
          }

          // Offline actions queue
          if (!db.objectStoreNames.contains(STORES.OFFLINE_ACTIONS)) {
            const actionsStore = db.createObjectStore(STORES.OFFLINE_ACTIONS, { keyPath: 'id' })
            actionsStore.createIndex('timestamp', 'timestamp')
            actionsStore.createIndex('status', 'status')
            actionsStore.createIndex('entity', 'entity')
          }

          // Search cache
          if (!db.objectStoreNames.contains(STORES.SEARCH_CACHE)) {
            const searchStore = db.createObjectStore(STORES.SEARCH_CACHE, { keyPath: 'id' })
            searchStore.createIndex('expiresAt', 'expiresAt')
          }

          // Settings store
          if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
            db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
          }

          // User data store
          if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
            db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' })
          }
        }
      })

      console.log('OfflineManager initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize OfflineManager:', error)
      return false
    }
  }

  // Cache Management
  async cacheData(store: keyof typeof STORES, data: any, expiresIn?: number): Promise<boolean> {
    if (!this.db) return false

    try {
      const cachedItem: CachedData = {
        id: data.id || Date.now().toString(),
        data,
        timestamp: new Date(),
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
        version: 1
      }

      await this.db.put(STORES[store], cachedItem)
      return true
    } catch (error) {
      console.error(`Failed to cache data in ${store}:`, error)
      return false
    }
  }

  async getCachedData(store: keyof typeof STORES, id?: string): Promise<any[]> {
    if (!this.db) return []

    try {
      if (id) {
        const item = await this.db.get(STORES[store], id)
        if (item && (!item.expiresAt || item.expiresAt > new Date())) {
          return [item.data]
        }
        return []
      } else {
        const items = await this.db.getAll(STORES[store])
        return items
          .filter(item => !item.expiresAt || item.expiresAt > new Date())
          .map(item => item.data)
      }
    } catch (error) {
      console.error(`Failed to get cached data from ${store}:`, error)
      return []
    }
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) return

    try {
      const stores = Object.values(STORES)
      for (const storeName of stores) {
        const tx = this.db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        const items = await store.getAll()
        
        for (const item of items) {
          if (item.expiresAt && item.expiresAt <= new Date()) {
            await store.delete(item.id)
          }
        }
      }
      
      console.log('Expired cache cleared')
    } catch (error) {
      console.error('Failed to clear expired cache:', error)
    }
  }

  // Offline Actions Queue
  async queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized')

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const offlineAction: OfflineAction = {
      id,
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending',
      ...action
    }

    try {
      await this.db.put(STORES.OFFLINE_ACTIONS, offlineAction)
      console.log(`Queued offline action: ${action.type} ${action.entity}`)
      
      // Try to sync immediately if online
      if (this.isOnline) {
        this.syncOfflineActions()
      }
      
      return id
    } catch (error) {
      console.error('Failed to queue offline action:', error)
      throw error
    }
  }

  async syncOfflineActions(): Promise<void> {
    if (!this.db || this.syncInProgress || !this.isOnline) return

    this.syncInProgress = true
    console.log('Starting offline actions sync...')

    try {
      const pendingActions = await this.db.getAllFromIndex(STORES.OFFLINE_ACTIONS, 'status', 'pending')
      const failedActions = await this.db.getAllFromIndex(STORES.OFFLINE_ACTIONS, 'status', 'failed')
      const actionsToSync = [...pendingActions, ...failedActions.filter(a => a.retryCount < a.maxRetries)]

      for (const action of actionsToSync.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())) {
        try {
          // Mark as syncing
          action.status = 'syncing'
          await this.db.put(STORES.OFFLINE_ACTIONS, action)

          // Execute the action
          await this.executeOfflineAction(action)

          // Mark as completed
          action.status = 'completed'
          await this.db.put(STORES.OFFLINE_ACTIONS, action)

          console.log(`Synced offline action: ${action.type} ${action.entity}`)
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error)
          
          action.retryCount++
          action.error = error instanceof Error ? error.message : 'Unknown error'
          
          if (action.retryCount >= action.maxRetries) {
            action.status = 'failed'
          } else {
            action.status = 'pending'
            // Schedule retry with exponential backoff
            const retryDelay = Math.min(1000 * Math.pow(2, action.retryCount), 30000)
            this.scheduleRetry(action.id, retryDelay)
          }
          
          await this.db.put(STORES.OFFLINE_ACTIONS, action)
        }
      }

      // Clean up completed actions older than 24 hours
      await this.cleanupCompletedActions()
    } catch (error) {
      console.error('Sync process failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  private async executeOfflineAction(action: OfflineAction): Promise<void> {
    // This would integrate with your tRPC client to execute the actual API calls
    const endpoint = this.getEndpointForAction(action)
    
    switch (action.type) {
      case 'CREATE':
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })
        break
      case 'UPDATE':
        await fetch(`${endpoint}/${action.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })
        break
      case 'DELETE':
        await fetch(`${endpoint}/${action.data.id}`, {
          method: 'DELETE'
        })
        break
    }
  }

  private getEndpointForAction(action: OfflineAction): string {
    const baseUrl = '/api/trpc'
    switch (action.entity) {
      case 'item': return `${baseUrl}/items`
      case 'location': return `${baseUrl}/locations`
      case 'category': return `${baseUrl}/categories`
      case 'activity': return `${baseUrl}/activities`
      default: throw new Error(`Unknown entity: ${action.entity}`)
    }
  }

  private scheduleRetry(actionId: string, delay: number): void {
    const timeout = setTimeout(() => {
      this.syncOfflineActions()
      this.retryTimeouts.delete(actionId)
    }, delay)
    
    this.retryTimeouts.set(actionId, timeout)
  }

  private async cleanupCompletedActions(): Promise<void> {
    if (!this.db) return

    try {
      const completedActions = await this.db.getAllFromIndex(STORES.OFFLINE_ACTIONS, 'status', 'completed')
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      
      for (const action of completedActions) {
        if (action.timestamp < cutoff) {
          await this.db.delete(STORES.OFFLINE_ACTIONS, action.id)
        }
      }
    } catch (error) {
      console.error('Failed to cleanup completed actions:', error)
    }
  }

  // Online/Offline Management
  private setupOnlineListeners(): void {
    if (typeof window === 'undefined') return
    
    window.addEventListener('online', () => {
      console.log('App went online')
      this.isOnline = true
      this.syncOfflineActions()
    })

    window.addEventListener('offline', () => {
      console.log('App went offline')
      this.isOnline = false
    })
  }

  isConnected(): boolean {
    return this.isOnline
  }

  // Search Cache Management
  async cacheSearchResult(query: string, results: any[], expiresIn = 10 * 60 * 1000): Promise<void> {
    const searchCache = {
      id: `search:${query.toLowerCase()}`,
      data: results,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + expiresIn),
      version: 1
    }

    await this.cacheData('SEARCH_CACHE', searchCache, expiresIn)
  }

  async getCachedSearchResult(query: string): Promise<any[] | null> {
    const results = await this.getCachedData('SEARCH_CACHE', `search:${query.toLowerCase()}`)
    return results.length > 0 ? results[0] : null
  }

  // Settings Management
  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) return

    try {
      await this.db.put(STORES.SETTINGS, { key, value, timestamp: new Date() })
    } catch (error) {
      console.error('Failed to save setting:', error)
    }
  }

  async getSetting(key: string, defaultValue?: any): Promise<any> {
    if (!this.db) return defaultValue

    try {
      const setting = await this.db.get(STORES.SETTINGS, key)
      return setting ? setting.value : defaultValue
    } catch (error) {
      console.error('Failed to get setting:', error)
      return defaultValue
    }
  }

  // Data Export/Backup
  async exportOfflineData(): Promise<{ [storeName: string]: any[] }> {
    if (!this.db) return {}

    const exportData: { [storeName: string]: any[] } = {}
    
    try {
      for (const [key, storeName] of Object.entries(STORES)) {
        exportData[key] = await this.getCachedData(key as keyof typeof STORES)
      }
      
      return exportData
    } catch (error) {
      console.error('Failed to export offline data:', error)
      return {}
    }
  }

  async importOfflineData(data: { [storeName: string]: any[] }): Promise<boolean> {
    if (!this.db) return false

    try {
      for (const [storeKey, items] of Object.entries(data)) {
        if (storeKey in STORES) {
          for (const item of items) {
            await this.cacheData(storeKey as keyof typeof STORES, item)
          }
        }
      }
      
      console.log('Offline data imported successfully')
      return true
    } catch (error) {
      console.error('Failed to import offline data:', error)
      return false
    }
  }

  // Statistics
  async getOfflineStats(): Promise<{
    totalCachedItems: number
    pendingActions: number
    failedActions: number
    cacheSize: string
    lastSync: Date | null
  }> {
    if (!this.db) {
      return {
        totalCachedItems: 0,
        pendingActions: 0,
        failedActions: 0,
        cacheSize: '0 MB',
        lastSync: null
      }
    }

    try {
      const [items, locations, categories, activities, pendingActions, failedActions] = await Promise.all([
        this.getCachedData('ITEMS'),
        this.getCachedData('LOCATIONS'),
        this.getCachedData('CATEGORIES'),
        this.getCachedData('ACTIVITIES'),
        this.db.getAllFromIndex(STORES.OFFLINE_ACTIONS, 'status', 'pending'),
        this.db.getAllFromIndex(STORES.OFFLINE_ACTIONS, 'status', 'failed')
      ])

      const totalCachedItems = items.length + locations.length + categories.length + activities.length
      
      // Estimate cache size (rough calculation)
      const dataString = JSON.stringify({ items, locations, categories, activities })
      const cacheSizeBytes = new Blob([dataString]).size
      const cacheSizeMB = (cacheSizeBytes / 1024 / 1024).toFixed(2)

      // Get last successful sync
      const completedActions = await this.db.getAllFromIndex(STORES.OFFLINE_ACTIONS, 'status', 'completed')
      const lastSync = completedActions.length > 0 
        ? new Date(Math.max(...completedActions.map(a => a.timestamp.getTime())))
        : null

      return {
        totalCachedItems,
        pendingActions: pendingActions.length,
        failedActions: failedActions.length,
        cacheSize: `${cacheSizeMB} MB`,
        lastSync
      }
    } catch (error) {
      console.error('Failed to get offline stats:', error)
      return {
        totalCachedItems: 0,
        pendingActions: 0,
        failedActions: 0,
        cacheSize: '0 MB',
        lastSync: null
      }
    }
  }

  async clearAllOfflineData(): Promise<boolean> {
    if (!this.db) return false

    try {
      const stores = Object.values(STORES)
      for (const storeName of stores) {
        await this.db.clear(storeName)
      }
      
      console.log('All offline data cleared')
      return true
    } catch (error) {
      console.error('Failed to clear offline data:', error)
      return false
    }
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager()
