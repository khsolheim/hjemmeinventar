import { db } from '@/lib/db'
import webpush from 'web-push'

// Configure VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:admin@hjemmeinventar.no',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

export class NotificationJobService {
  private static instance: NotificationJobService

  static getInstance(): NotificationJobService {
    if (!NotificationJobService.instance) {
      NotificationJobService.instance = new NotificationJobService()
    }
    return NotificationJobService.instance
  }

  // Check for expiring items and send notifications
  async checkExpiryDates(): Promise<void> {
    try {
      console.log('Checking for expiring items...')

      // Get items expiring in the next 7 days
      const expiringItems = await db.item.findMany({
        where: {
          expiryDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          }
        },
        include: {
          user: true,
          location: true,
          category: true
        }
      })

      if (expiringItems.length === 0) {
        console.log('No expiring items found')
        return
      }

      // Group by user
      const itemsByUser = expiringItems.reduce((acc, item) => {
        const userId = item.userId
        if (!acc[userId]) {
          acc[userId] = []
        }
        acc[userId].push(item)
        return acc
      }, {} as Record<string, typeof expiringItems>)

      // Send notifications to each user
      for (const [userId, items] of Object.entries(itemsByUser)) {
        await this.sendExpiryNotification(userId, items)
      }

      console.log(`Processed expiry notifications for ${Object.keys(itemsByUser).length} users`)
    } catch (error) {
      console.error('Error checking expiry dates:', error)
    }
  }

  // Check for overdue loans and send notifications
  async checkOverdueLoans(): Promise<void> {
    try {
      console.log('Checking for overdue loans...')

      // Get loans that are overdue
      const overdueLoans = await db.loan.findMany({
        where: {
          expectedReturnDate: {
            lt: new Date()
          },
          status: 'OUT'
        },
        include: {
          user: true,
          item: {
            include: {
              location: true,
              category: true
            }
          }
        }
      })

      if (overdueLoans.length === 0) {
        console.log('No overdue loans found')
        return
      }

      // Update loan status to OVERDUE
      const loanIds = overdueLoans.map(loan => loan.id)
      await db.loan.updateMany({
        where: { id: { in: loanIds } },
        data: { status: 'OVERDUE' }
      })

      // Group by user
      const loansByUser = overdueLoans.reduce((acc, loan) => {
        const userId = loan.userId
        if (!acc[userId]) {
          acc[userId] = []
        }
        acc[userId].push(loan)
        return acc
      }, {} as Record<string, typeof overdueLoans>)

      // Send notifications to each user
      for (const [userId, loans] of Object.entries(loansByUser)) {
        await this.sendOverdueLoanNotification(userId, loans)
      }

      console.log(`Processed overdue loan notifications for ${Object.keys(loansByUser).length} users`)
    } catch (error) {
      console.error('Error checking overdue loans:', error)
    }
  }

  // Check for low stock items
  async checkLowStock(): Promise<void> {
    try {
      console.log('Checking for low stock items...')

      // Get items with quantity <= 1
      const lowStockItems = await db.item.findMany({
        where: {
          quantity: {
            lte: 1
          }
        },
        include: {
          user: true,
          location: true,
          category: true
        }
      })

      if (lowStockItems.length === 0) {
        console.log('No low stock items found')
        return
      }

      // Group by user
      const itemsByUser = lowStockItems.reduce((acc, item) => {
        const userId = item.userId
        if (!acc[userId]) {
          acc[userId] = []
        }
        acc[userId].push(item)
        return acc
      }, {} as Record<string, typeof lowStockItems>)

      // Send notifications to each user
      for (const [userId, items] of Object.entries(itemsByUser)) {
        await this.sendLowStockNotification(userId, items)
      }

      console.log(`Processed low stock notifications for ${Object.keys(itemsByUser).length} users`)
    } catch (error) {
      console.error('Error checking low stock:', error)
    }
  }

  // Send expiry notification to user
  private async sendExpiryNotification(userId: string, items: any[]): Promise<void> {
    const criticalItems = items.filter(item => {
      const daysUntilExpiry = Math.ceil(
        (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysUntilExpiry <= 2
    })

    const title = criticalItems.length > 0 
      ? '⚠️ Kritisk: Produkter utløper snart!'
      : '📅 Påminnelse: Produkter nærmer seg utløpsdato'

    const body = criticalItems.length > 0
      ? `${criticalItems.length} produkter utløper i løpet av 2 dager`
      : `${items.length} produkter utløper i løpet av en uke`

    const notification = {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'expiry-reminder',
      requireInteraction: criticalItems.length > 0,
      data: {
        type: 'EXPIRY_REMINDER',
        url: '/items?filter=expiring',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          expiryDate: item.expiryDate,
          location: item.location.name
        }))
      }
    }

    await this.sendNotificationToUser(userId, notification)
  }

  // Send overdue loan notification to user
  private async sendOverdueLoanNotification(userId: string, loans: any[]): Promise<void> {
    const title = '🚨 Forsinkede utlån'
    const body = `${loans.length} utlån${loans.length > 1 ? ' er' : ' er'} forsinket`

    const notification = {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'overdue-loans',
      requireInteraction: true,
      data: {
        type: 'LOAN_OVERDUE',
        url: '/loans?filter=overdue',
        loans: loans.map(loan => ({
          id: loan.id,
          itemName: loan.item.name,
          loanedTo: loan.loanedTo,
          expectedReturnDate: loan.expectedReturnDate
        }))
      }
    }

    await this.sendNotificationToUser(userId, notification)
  }

  // Send low stock notification to user
  private async sendLowStockNotification(userId: string, items: any[]): Promise<void> {
    const title = '📦 Lavt lager'
    const body = `${items.length} gjenstand${items.length > 1 ? 'er har' : ' har'} lavt lager`

    const notification = {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'low-stock',
      requireInteraction: false,
      data: {
        type: 'LOW_STOCK',
        url: '/items?filter=low-stock',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          location: item.location.name
        }))
      }
    }

    await this.sendNotificationToUser(userId, notification)
  }

  // Send notification to specific user
  private async sendNotificationToUser(userId: string, notification: any): Promise<void> {
    try {
      // In a real implementation, get user's push subscriptions from database
      // const subscriptions = await db.pushSubscription.findMany({
      //   where: { userId }
      // })

      console.log(`Would send notification to user ${userId}:`, notification)
      
      // For now, just log the notification
      // In production, this would actually send the push notification
      
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error)
    }
  }

  // Daily digest notification
  async sendDailyDigest(): Promise<void> {
    try {
      console.log('Generating daily digest...')

      // Get all users who have daily digest enabled
      // const users = await db.user.findMany({
      //   where: { notificationSettings: { dailyDigest: true } }
      // })

      // For each user, generate a digest
      // This would include: new items added, upcoming expiries, loan status, etc.

      console.log('Daily digest generation completed')
    } catch (error) {
      console.error('Error generating daily digest:', error)
    }
  }

  // Run all notification checks
  async runAllChecks(): Promise<void> {
    console.log('Running all notification checks...')
    
    await Promise.allSettled([
      this.checkExpiryDates(),
      this.checkOverdueLoans(),
      this.checkLowStock()
    ])

    console.log('All notification checks completed')
  }
}

// Export singleton instance
export const notificationJobs = NotificationJobService.getInstance()

// Scheduler functions for different environments
export function scheduleNotificationJobs() {
  // In a real production environment, you would use:
  // - Vercel Cron Jobs
  // - Inngest
  // - GitHub Actions
  // - or another scheduling service

  console.log('Notification jobs would be scheduled here')
  
  // Example: Run checks every hour
  // setInterval(() => {
  //   notificationJobs.runAllChecks()
  // }, 60 * 60 * 1000) // 1 hour
}

// API endpoint helper for manual triggering
export async function triggerNotificationCheck(type?: 'expiry' | 'loans' | 'stock' | 'all') {
  const jobs = notificationJobs

  switch (type) {
    case 'expiry':
      await jobs.checkExpiryDates()
      break
    case 'loans':
      await jobs.checkOverdueLoans()
      break
    case 'stock':
      await jobs.checkLowStock()
      break
    case 'all':
    default:
      await jobs.runAllChecks()
      break
  }
}
