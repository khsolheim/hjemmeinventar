import { inngest } from '../client'
import { db } from '@/lib/db'

// Generate analytics data
export const generateAnalytics = inngest.createFunction(
  { id: 'generate-analytics' },
  { event: 'analytics/generate' },
  async ({ event, step }) => {
    const { userId, type, date } = event.data
    
    console.log(`Generating ${type} analytics for ${userId ? `user ${userId}` : 'all users'} on ${date}`)

    // Step 1: Generate inventory statistics
    const inventoryStats = await step.run('generate-inventory-stats', async () => {
      const where = userId ? { userId } : {}
      
      const stats = {
        totalItems: await db.item.count({ where }),
        totalLocations: await db.location.count({ where }),
        totalCategories: await db.category.count(),
        totalValue: 0,
        itemsAddedThisPeriod: 0,
        itemsExpiringSoon: 0,
        activeLoans: 0,
        overdueLoans: 0
      }

      // Calculate total value
      const itemValues = await db.item.aggregate({
        where: { ...where, price: { not: null } },
        _sum: { price: true }
      })
      stats.totalValue = Number(itemValues._sum.price) || 0

      // Items added this period
      const periodStart = getPeriodStart(type, date)
      stats.itemsAddedThisPeriod = await db.item.count({
        where: {
          ...where,
          createdAt: { gte: periodStart }
        }
      })

      // Items expiring soon (next 7 days)
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      stats.itemsExpiringSoon = await db.item.count({
        where: {
          ...where,
          expiryDate: {
            gte: new Date(),
            lte: weekFromNow
          }
        }
      })

      // Loan statistics
      stats.activeLoans = await db.loan.count({
        where: {
          ...where,
          status: { in: ['OUT', 'OVERDUE'] }
        }
      })

      stats.overdueLoans = await db.loan.count({
        where: {
          ...where,
          status: 'OVERDUE'
        }
      })

      return stats
    })

    // Step 2: Generate category analytics
    const categoryAnalytics = await step.run('generate-category-analytics', async () => {
      const categories = await db.category.findMany({
        include: {
          items: {
            where: userId ? { userId } : {},
            select: {
              id: true,
              price: true,
              totalQuantity: true,
              createdAt: true
            }
          }
        }
      })

      return categories.map(category => {
        const totalValue = category.items.reduce((sum: number, item: any) => 
          sum + (item.price || 0) * item.totalQuantity, 0
        )
        
        const periodStart = getPeriodStart(type, date)
        const itemsAddedThisPeriod = category.items.filter(
          (item: any) => item.createdAt >= periodStart
        ).length

        return {
          categoryId: category.id,
          name: category.name,
          itemCount: category.items.length,
          totalValue,
          averageValue: category.items.length > 0 ? totalValue / category.items.length : 0,
          itemsAddedThisPeriod
        }
      })
    })

    // Step 3: Generate location analytics
    const locationAnalytics = await step.run('generate-location-analytics', async () => {
      const where = userId ? { userId } : {}
      
      const locations = await db.location.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              price: true,
              totalQuantity: true,
              createdAt: true
            }
          }
        }
      })

      return locations.map(location => {
        const totalValue = location.items.reduce((sum: number, item: any) => 
          sum + (item.price || 0) * item.totalQuantity, 0
        )
        
        const utilizationPercentage = location.items.length > 0 
          ? Math.min((location.items.length / 50) * 100, 100) // Assume max 50 items per location
          : 0

        return {
          locationId: location.id,
          name: location.name,
          type: location.type,
          itemCount: location.items.length,
          totalValue,
          utilizationPercentage: Math.round(utilizationPercentage)
        }
      })
    })

    // Step 4: Generate activity insights
    const activityInsights = await step.run('generate-activity-insights', async () => {
      const where = userId ? { userId } : {}
      const periodStart = getPeriodStart(type, date)
      
      const activities = await db.activity.findMany({
        where: {
          ...where,
          createdAt: { gte: periodStart }
        },
        orderBy: { createdAt: 'desc' }
      })

      const activityByType = activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const activityByDay = activities.reduce((acc, activity) => {
        const day = activity.createdAt.toISOString().split('T')[0]
        acc[day!] = (acc[day!] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        totalActivities: activities.length,
        activityByType,
        activityByDay,
        averageActivitiesPerDay: Object.keys(activityByDay).length > 0 
          ? activities.length / Object.keys(activityByDay).length 
          : 0
      }
    })

    // Step 5: Store analytics results
    const analyticsRecord = await step.run('store-analytics', async () => {
      // In a real implementation, you might store this in a dedicated analytics table
      // For now, we'll create an activity record
      const analyticsData = {
        type,
        date,
        inventoryStats,
        categoryAnalytics,
        locationAnalytics,
        activityInsights
      }

      const activity = await db.activity.create({
        data: {
          type: 'ANALYTICS_GENERATED' as any,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} analytics generated`,
          userId: userId || 'system',
          metadata: JSON.stringify(analyticsData)
        }
      })

      console.log(`Stored analytics record: ${activity.id}`)
      return activity.id
    })

    return {
      success: true,
      type,
      date,
      userId,
      analyticsRecordId: analyticsRecord,
      inventoryStats,
      categoryAnalytics: categoryAnalytics.length,
      locationAnalytics: locationAnalytics.length,
      activityInsights: activityInsights.totalActivities,
      message: `${type} analytics generated successfully`
    }
  }
)

// Monthly deep analytics and reporting
export const monthlyAnalyticsReport = inngest.createFunction(
  { id: 'monthly-analytics-report' },
  { cron: '0 2 1 * *' }, // Run on the 1st of every month at 2 AM
  async ({ event, step }) => {
    console.log('Generating monthly analytics report')

    // Step 1: Generate analytics for all users
    const allUsers = await step.run('get-all-users', async () => {
      return await db.user.findMany({
        select: { id: true, email: true, name: true }
      })
    })

    // Step 2: Generate individual reports
    const userReports = await step.run('generate-user-reports', async () => {
      const reports = []
      
      for (const user of allUsers) {
        await inngest.send({
          name: 'analytics/generate',
          data: {
            userId: user.id,
            type: 'monthly',
            date: new Date().toISOString()
          }
        })
        
        reports.push(user.id)
      }
      
      return reports
    })

    // Step 3: Generate system-wide analytics
    await step.run('generate-system-analytics', async () => {
      await inngest.send({
        name: 'analytics/generate',
        data: {
          type: 'monthly',
          date: new Date().toISOString()
        }
      })
    })

    // Step 4: Generate insights and trends
    const monthlyInsights = await step.run('generate-monthly-insights', async () => {
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      // Growth metrics
      const itemsThisMonth = await db.item.count({
        where: { createdAt: { gte: thisMonth } }
      })
      
      const itemsLastMonth = await db.item.count({
        where: { 
          createdAt: { 
            gte: lastMonth,
            lt: thisMonth
          }
        }
      })

      const growthRate = itemsLastMonth > 0 
        ? ((itemsThisMonth - itemsLastMonth) / itemsLastMonth) * 100 
        : 0

      // Most active users
      const mostActiveUsers = await db.activity.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: thisMonth } },
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      })

      // Popular categories
      const popularCategories = await db.item.groupBy({
        by: ['categoryId'],
        where: { 
          createdAt: { gte: thisMonth },
          categoryId: { not: null }
        },
        _count: { categoryId: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 10
      })

      return {
        itemsThisMonth,
        itemsLastMonth,
        growthRate: Math.round(growthRate * 100) / 100,
        mostActiveUsers: mostActiveUsers.length,
        popularCategories: popularCategories.length
      }
    })

    return {
      success: true,
      month: new Date().toISOString().split('T')[0],
      userReports: userReports.length,
      insights: monthlyInsights,
      message: 'Monthly analytics report generated successfully'
    }
  }
)

// Helper function to get period start date
function getPeriodStart(type: string, date: string): Date {
  const baseDate = new Date(date)
  
  switch (type) {
    case 'daily':
      return new Date(baseDate.setHours(0, 0, 0, 0))
    
    case 'weekly':
      const weekStart = new Date(baseDate)
      weekStart.setDate(baseDate.getDate() - baseDate.getDay())
      return new Date(weekStart.setHours(0, 0, 0, 0))
    
    case 'monthly':
      return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
    
    default:
      return new Date(baseDate.setHours(0, 0, 0, 0))
  }
}
