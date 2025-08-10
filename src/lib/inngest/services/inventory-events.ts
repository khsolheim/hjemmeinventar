import { sendEvent, createEvent } from '../client'
import type { InngestEvents } from '../client'

/**
 * Service for triggering inventory-related background jobs
 * This provides a clean interface for the rest of the application
 * to interact with Inngest without direct coupling
 */
export class InventoryEventService {
  
  /**
   * Trigger when a new item is created
   */
  static async onItemCreated(data: {
    itemId: string
    userId: string
    categoryId?: string
    locationId?: string
    expiryDate?: Date
  }) {
    try {
      await sendEvent('inventory/item.created', {
        itemId: data.itemId,
        userId: data.userId,
        categoryId: data.categoryId,
        locationId: data.locationId,
        expiryDate: data.expiryDate?.toISOString()
      })
      
      console.log(`Item creation event sent: ${data.itemId}`)
    } catch (error) {
      console.error('Failed to send item creation event:', error)
      // Don't throw - background job failures shouldn't break the main flow
    }
  }

  /**
   * Trigger when an item is updated
   */
  static async onItemUpdated(data: {
    itemId: string
    userId: string
    changes: Record<string, any>
    oldValues: Record<string, any>
  }) {
    try {
      await sendEvent('inventory/item.updated', data)
      console.log(`Item update event sent: ${data.itemId}`)
    } catch (error) {
      console.error('Failed to send item update event:', error)
    }
  }

  /**
   * Trigger when an item is deleted
   */
  static async onItemDeleted(data: {
    itemId: string
    userId: string
  }) {
    try {
      await sendEvent('inventory/item.deleted', data)
      console.log(`Item deletion event sent: ${data.itemId}`)
    } catch (error) {
      console.error('Failed to send item deletion event:', error)
    }
  }

  /**
   * Trigger when a new loan is created
   */
  static async onLoanCreated(data: {
    loanId: string
    itemId: string
    userId: string
    loanedTo: string
    expectedReturnDate: Date
  }) {
    try {
      await sendEvent('inventory/loan.created', {
        ...data,
        expectedReturnDate: data.expectedReturnDate.toISOString()
      })
      
      console.log(`Loan creation event sent: ${data.loanId}`)
    } catch (error) {
      console.error('Failed to send loan creation event:', error)
    }
  }

  /**
   * Trigger when a loan becomes overdue
   */
  static async onLoanOverdue(data: {
    loanId: string
    itemId: string
    userId: string
    daysOverdue: number
  }) {
    try {
      await sendEvent('inventory/loan.overdue', data)
      console.log(`Loan overdue event sent: ${data.loanId}`)
    } catch (error) {
      console.error('Failed to send loan overdue event:', error)
    }
  }

  /**
   * Trigger when an item's expiry is approaching
   */
  static async onExpiryApproaching(data: {
    itemId: string
    userId: string
    expiryDate: Date
    daysUntilExpiry: number
  }) {
    try {
      await sendEvent('inventory/expiry.approaching', {
        ...data,
        expiryDate: data.expiryDate.toISOString()
      })
      
      console.log(`Expiry approaching event sent: ${data.itemId}`)
    } catch (error) {
      console.error('Failed to send expiry approaching event:', error)
    }
  }

  /**
   * Send a notification to a user
   */
  static async sendNotification(data: {
    userId: string
    type: 'expiry' | 'loan' | 'general'
    title: string
    message: string
    data?: any
  }) {
    try {
      await sendEvent('user/notification.send', data)
      console.log(`Notification event sent to user: ${data.userId}`)
    } catch (error) {
      console.error('Failed to send notification event:', error)
    }
  }

  /**
   * Trigger analytics generation
   */
  static async generateAnalytics(data: {
    userId?: string
    type: 'daily' | 'weekly' | 'monthly'
    date?: Date
  }) {
    try {
      await sendEvent('analytics/generate', {
        userId: data.userId,
        type: data.type,
        date: (data.date || new Date()).toISOString()
      })
      
      console.log(`Analytics generation event sent: ${data.type}`)
    } catch (error) {
      console.error('Failed to send analytics generation event:', error)
    }
  }

  /**
   * Trigger daily maintenance manually
   */
  static async triggerDailyMaintenance() {
    try {
      await sendEvent('maintenance/daily', {
        date: new Date().toISOString()
      })
      
      console.log('Daily maintenance event sent')
    } catch (error) {
      console.error('Failed to send daily maintenance event:', error)
      throw error // This one we want to throw since it's likely a manual trigger
    }
  }

  /**
   * Trigger weekly maintenance manually
   */
  static async triggerWeeklyMaintenance() {
    try {
      const now = new Date()
      const weekNumber = Math.ceil(now.getDate() / 7)
      
      await sendEvent('maintenance/weekly', {
        date: now.toISOString(),
        week: weekNumber
      })
      
      console.log('Weekly maintenance event sent')
    } catch (error) {
      console.error('Failed to send weekly maintenance event:', error)
      throw error
    }
  }

  /**
   * Batch send multiple events efficiently
   */
  static async sendBatchEvents(events: Array<{
    name: keyof InngestEvents
    data: any
  }>) {
    try {
      const { inngest } = await import('../client')
      await inngest.send(events)
      
      console.log(`Batch events sent: ${events.length} events`)
    } catch (error) {
      console.error('Failed to send batch events:', error)
      throw error
    }
  }
}

// Convenience export
export const inventoryEvents = InventoryEventService
