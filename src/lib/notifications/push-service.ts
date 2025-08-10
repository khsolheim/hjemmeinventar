'use client'

export interface NotificationData {
  type: 'EXPIRY_REMINDER' | 'LOAN_OVERDUE' | 'LOW_STOCK' | 'GENERAL'
  title: string
  body: string
  url?: string
  items?: any[]
  requireInteraction?: boolean
}

export class PushNotificationService {
  private static instance: PushNotificationService
  private isSupported: boolean = false
  private isSubscribed: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
    }
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Push notifications not supported')
      return false
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered:', registration)

      // Check if already subscribed
      const subscription = await registration.pushManager.getSubscription()
      this.isSubscribed = !!subscription

      return true
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied'
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  }

  async subscribe(userId: string): Promise<boolean> {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription()
      
      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
          )
        })
      }

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      })

      if (response.ok) {
        this.isSubscribed = true
        console.log('Push notification subscription successful')
        return true
      } else {
        console.error('Failed to save subscription to server')
        return false
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return false
    }
  }

  async unsubscribe(userId: string): Promise<boolean> {
    if (!this.isSupported) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push service
        await subscription.unsubscribe()

        // Remove subscription from server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            endpoint: subscription.endpoint
          })
        })

        this.isSubscribed = false
        console.log('Push notification unsubscription successful')
        return true
      }

      return true
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  async showLocalNotification(data: NotificationData): Promise<void> {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return
    }

    const options: NotificationOptions = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: `hjemmeinventar-${data.type}`,
      data: {
        type: data.type,
        url: data.url,
        items: data.items
      },
      requireInteraction: data.requireInteraction || false,
      vibrate: [200, 100, 200]
    }

    const notification = new Notification(data.title, options)

    // Handle click
    notification.onclick = () => {
      window.focus()
      if (data.url) {
        window.location.href = data.url
      }
      notification.close()
    }

    // Auto close after 5 seconds if not requiring interaction
    if (!data.requireInteraction) {
      setTimeout(() => {
        notification.close()
      }, 5000)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Utility methods
  getPermissionStatus(): NotificationPermission {
    return Notification.permission
  }

  isNotificationSupported(): boolean {
    return this.isSupported
  }

  isUserSubscribed(): boolean {
    return this.isSubscribed
  }

  // Test notification
  async sendTestNotification(): Promise<void> {
    await this.showLocalNotification({
      type: 'GENERAL',
      title: 'Test Notifikasjon',
      body: 'Dette er en test av push notifications systemet!',
      url: '/dashboard'
    })
  }
}

// Singleton instance
export const pushService = PushNotificationService.getInstance()

// Hook for React components
export function usePushNotifications(userId?: string) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const initializeService = async () => {
      const initialized = await pushService.initialize()
      setIsSupported(initialized)
      setPermission(pushService.getPermissionStatus())
      setIsSubscribed(pushService.isUserSubscribed())
    }

    initializeService()
  }, [])

  const requestPermission = async () => {
    const newPermission = await pushService.requestPermission()
    setPermission(newPermission)
    return newPermission
  }

  const subscribe = async () => {
    if (!userId) return false
    const success = await pushService.subscribe(userId)
    setIsSubscribed(success)
    return success
  }

  const unsubscribe = async () => {
    if (!userId) return false
    const success = await pushService.unsubscribe(userId)
    setIsSubscribed(!success)
    return success
  }

  const sendTestNotification = async () => {
    await pushService.sendTestNotification()
  }

  return {
    permission,
    isSubscribed,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  }
}

// Add missing import
import { useState, useEffect } from 'react'
