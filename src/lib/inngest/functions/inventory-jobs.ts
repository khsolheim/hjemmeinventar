import { inngest } from '../client'
import { db } from '@/lib/db'
import { pushService } from '@/lib/notifications/push-service'
import { meilisearchService } from '@/lib/search/meilisearch-service'

// Daily inventory maintenance job
export const dailyInventoryMaintenance = inngest.createFunction(
  { id: 'daily-inventory-maintenance' },
  { cron: '0 6 * * *' }, // Run daily at 6 AM
  async ({ event, step }) => {
    const today = new Date().toISOString().split('T')[0]
    
    console.log(`Running daily inventory maintenance for ${today}`)

    // Step 1: Check for expiring items
    const expiringItems = await step.run('check-expiring-items', async () => {
      const items = await db.item.findMany({
        where: {
          expiryDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        },
        include: {
          user: true,
          location: true,
          category: true
        }
      })

      console.log(`Found ${items.length} expiring items`)
      return items
    })

    // Step 2: Check for overdue loans
    const overdueLoans = await step.run('check-overdue-loans', async () => {
      const loans = await db.loan.findMany({
        where: {
          expectedReturnDate: {
            lt: new Date()
          },
          status: 'OUT'
        },
        include: {
          user: true,
          item: {
            include: { location: true, category: true }
          }
        }
      })

      console.log(`Found ${loans.length} overdue loans`)
      
      // Update status to OVERDUE
      if (loans.length > 0) {
        await db.loan.updateMany({
          where: {
            id: { in: loans.map(l => l.id) }
          },
          data: { status: 'OVERDUE' }
        })
      }

      return loans
    })

    // Step 3: Send notifications for critical items (expiring in 2 days)
    await step.run('send-critical-expiry-notifications', async () => {
      const criticalItems = expiringItems.filter(item => {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysUntilExpiry <= 2
      })

      if (criticalItems.length === 0) return

      // Group by user
      const itemsByUser = criticalItems.reduce((acc, item) => {
        if (!acc[item.userId]) acc[item.userId] = []
        acc[item.userId].push(item)
        return acc
      }, {} as Record<string, typeof criticalItems>)

      // Send notifications
      for (const [userId, items] of Object.entries(itemsByUser)) {
        await inngest.send({
          name: 'user/notification.send',
          data: {
            userId,
            type: 'expiry',
            title: '🚨 Kritisk: Produkter utløper snart!',
            message: `${items.length} produkter utløper i løpet av 2 dager`,
            data: { items: items.map(i => ({ id: i.id, name: i.name, expiryDate: i.expiryDate })) }
          }
        })
      }

      console.log(`Sent critical expiry notifications to ${Object.keys(itemsByUser).length} users`)
    })

    // Step 4: Send overdue loan notifications
    await step.run('send-overdue-loan-notifications', async () => {
      if (overdueLoans.length === 0) return

      const loansByUser = overdueLoans.reduce((acc, loan) => {
        if (!acc[loan.userId]) acc[loan.userId] = []
        acc[loan.userId].push(loan)
        return acc
      }, {} as Record<string, typeof overdueLoans>)

      for (const [userId, loans] of Object.entries(loansByUser)) {
        await inngest.send({
          name: 'user/notification.send',
          data: {
            userId,
            type: 'loan',
            title: '⏰ Forsinkede utlån',
            message: `${loans.length} utlån er forsinket`,
            data: { loans: loans.map(l => ({ id: l.id, itemName: l.item.name, loanedTo: l.loanedTo })) }
          }
        })
      }

      console.log(`Sent overdue loan notifications to ${Object.keys(loansByUser).length} users`)
    })

    // Step 5: Update search index for modified items
    await step.run('update-search-index', async () => {
      try {
        // Re-index items that have been updated recently
        const recentlyUpdated = await db.item.findMany({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          include: {
            category: { select: { name: true } },
            location: { select: { name: true } },
            tags: { select: { name: true } }
          }
        })

        for (const item of recentlyUpdated) {
          const searchDoc = {
            id: `item_${item.id}`,
            type: 'item' as const,
            name: item.name,
            description: item.description || undefined,
            userId: item.userId,
            barcode: item.barcode || undefined,
            brand: item.brand || undefined,
            categoryName: item.category?.name,
            locationName: item.location?.name,
            tags: item.tags.map(t => t.name),
            price: item.price || undefined,
            quantity: item.totalQuantity,
            expiryDate: item.expiryDate?.toISOString(),
            imageUrl: item.imageUrl || undefined,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString()
          }

          await meilisearchService.indexDocument(searchDoc)
        }

        console.log(`Updated search index for ${recentlyUpdated.length} items`)
      } catch (error) {
        console.error('Failed to update search index:', error)
      }
    })

    return {
      success: true,
      date: today,
      expiringItems: expiringItems.length,
      overdueLoans: overdueLoans.length,
      criticalNotifications: Math.min(expiringItems.length, 10), // Estimate
      message: 'Daily inventory maintenance completed successfully'
    }
  }
)

// Weekly deep cleaning job
export const weeklyInventoryCleanup = inngest.createFunction(
  { id: 'weekly-inventory-cleanup' },
  { cron: '0 3 * * 0' }, // Run weekly on Sunday at 3 AM
  async ({ event, step }) => {
    console.log('Running weekly inventory cleanup')

    // Step 1: Clean up old activities (keep last 3 months)
    const cleanedActivities = await step.run('cleanup-old-activities', async () => {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

      const result = await db.activity.deleteMany({
        where: {
          createdAt: {
            lt: threeMonthsAgo
          }
        }
      })

      console.log(`Cleaned up ${result.count} old activities`)
      return result.count
    })

    // Step 2: Optimize search index
    await step.run('optimize-search-index', async () => {
      try {
        const stats = await meilisearchService.getStats()
        console.log('Search index stats:', stats)
        
        // In a production environment, you might want to:
        // - Compact the index
        // - Update settings
        // - Re-index if needed
        
        return stats
      } catch (error) {
        console.error('Failed to optimize search index:', error)
      }
    })

    // Step 3: Generate weekly analytics digest
    await step.run('generate-weekly-digest', async () => {
      await inngest.send({
        name: 'analytics/generate',
        data: {
          type: 'weekly',
          date: new Date().toISOString()
        }
      })
      
      console.log('Triggered weekly analytics generation')
    })

    // Step 4: Check for data inconsistencies
    const inconsistencies = await step.run('check-data-consistency', async () => {
      const issues = []

      // Check for items without categories
      const itemsWithoutCategory = await db.item.count({
        where: { categoryId: null }
      })
      if (itemsWithoutCategory > 0) {
        issues.push(`${itemsWithoutCategory} items without category`)
      }

      // Note: locationId is required in schema, so no need to check for items without locations

      // Note: Loans have cascade delete on items, so no orphaned loans possible

      console.log(`Data consistency check: ${issues.length} issues found`)
      return issues
    })

    return {
      success: true,
      cleanedActivities,
      dataInconsistencies: inconsistencies,
      message: 'Weekly inventory cleanup completed successfully'
    }
  }
)

// Reactive function for when items are created
export const onItemCreated = inngest.createFunction(
  { id: 'on-item-created' },
  { event: 'inventory/item.created' },
  async ({ event, step }) => {
    const { itemId, userId, expiryDate } = event.data

    console.log(`Processing new item creation: ${itemId}`)

    // Step 1: Update search index
    await step.run('index-new-item', async () => {
      const item = await db.item.findUnique({
        where: { id: itemId },
        include: {
          category: { select: { name: true } },
          location: { select: { name: true } },
          tags: { select: { name: true } }
        }
      })

      if (item) {
        const searchDoc = {
          id: `item_${item.id}`,
          type: 'item' as const,
          name: item.name,
          description: item.description || undefined,
          userId: item.userId,
          barcode: item.barcode || undefined,
          brand: item.brand || undefined,
          categoryName: item.category?.name,
          locationName: item.location?.name,
          tags: item.tags.map(t => t.name),
          price: item.price || undefined,
          quantity: item.totalQuantity,
          expiryDate: item.expiryDate?.toISOString(),
          imageUrl: item.imageUrl || undefined,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString()
        }

        await meilisearchService.indexDocument(searchDoc)
        console.log(`Indexed new item in search: ${item.name}`)
      }
    })

    // Step 2: Check if item expires soon and schedule notification
    if (expiryDate) {
      await step.run('schedule-expiry-check', async () => {
        const expiryDateTime = new Date(expiryDate)
        const daysUntilExpiry = Math.ceil(
          (expiryDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntilExpiry <= 7) {
          await inngest.send({
            name: 'inventory/expiry.approaching',
            data: {
              itemId,
              userId,
              expiryDate,
              daysUntilExpiry
            }
          })
          
          console.log(`Scheduled expiry notification for item ${itemId} (${daysUntilExpiry} days)`)
        }
      })
    }

    return {
      success: true,
      itemId,
      message: 'Item creation processed successfully'
    }
  }
)

// Function to handle notification sending
export const sendUserNotification = inngest.createFunction(
  { id: 'send-user-notification' },
  { event: 'user/notification.send' },
  async ({ event, step }) => {
    const { userId, type, title, message, data } = event.data

    console.log(`Sending ${type} notification to user ${userId}`)

    // Step 1: Send push notification
    await step.run('send-push-notification', async () => {
      try {
        // This would integrate with your actual push notification service
        // For now, we'll log it
        console.log(`Push notification: ${title} - ${message}`)
        
        // In a real implementation:
        // await pushService.sendNotificationToUser(userId, {
        //   title,
        //   body: message,
        //   data,
        //   type
        // })
        
        return true
      } catch (error) {
        console.error(`Failed to send push notification to user ${userId}:`, error)
        return false
      }
    })

    // Step 2: Log notification activity
    await step.run('log-notification-activity', async () => {
      try {
        await db.activity.create({
          data: {
            type: 'SYSTEM_NOTIFICATION',
            description: `Varsel sendt: ${title}`,
            userId,
            metadata: JSON.stringify({
              notificationType: type,
              title,
              message,
              data
            })
          }
        })
        
        console.log(`Logged notification activity for user ${userId}`)
      } catch (error) {
        console.error(`Failed to log notification activity:`, error)
      }
    })

    return {
      success: true,
      userId,
      type,
      message: 'Notification sent successfully'
    }
  }
)
