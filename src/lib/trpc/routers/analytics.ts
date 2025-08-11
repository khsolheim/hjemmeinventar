import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { db } from '@/lib/db'

export const analyticsRouter = createTRPCRouter({
  // Get comprehensive inventory statistics
  getInventoryStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session?.user?.id || ctx.user?.id
      if (!userId) throw new Error('User not authenticated')

      // Get basic counts
      const [items, locations, activities, loans] = await Promise.all([
        db.item.findMany({
          where: { userId },
          include: { category: true, location: true }
        }),
        db.location.findMany({
          where: { userId }
        }),
        db.activity.findMany({
          where: { userId },
          take: 100,
          orderBy: { createdAt: 'desc' }
        }),
        db.loan.findMany({
          where: { userId }
        })
      ])

      // Category distribution
      const categoryDistribution = items.reduce((acc, item) => {
        const categoryName = item.category?.name || 'Ukategorisert'
        acc[categoryName] = (acc[categoryName] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Location usage (items per location)
      const locationUsage = items.reduce((acc, item) => {
        const locationName = item.location.name
        acc[locationName] = (acc[locationName] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Timeline data (items added over time)
      const timeline = items.reduce((acc, item) => {
        const month = new Date(item.createdAt).toISOString().slice(0, 7) // YYYY-MM
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Value estimate
      const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0)
      const averageValue = items.length > 0 ? totalValue / items.length : 0

      // Activity heatmap (activities by hour of day)
      const activityHeatmap = activities.reduce((acc, activity) => {
        const hour = new Date(activity.createdAt).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      return {
        overview: {
          totalItems: items.length,
          totalLocations: locations.length,
          totalValue,
          averageValue,
          totalActivities: activities.length,
          activeLoans: loans.filter(loan => loan.status === 'OUT').length
        },
        categoryDistribution,
        locationUsage,
        timeline,
        valueEstimate: {
          total: totalValue,
          average: averageValue,
          highest: Math.max(...items.map(i => i.price || 0)),
          itemsWithPrice: items.filter(i => i.price && i.price > 0).length
        },
        activityHeatmap
      }
    }),

  // Get detailed category analytics
  getCategoryAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id

      const categories = await ctx.db.category.findMany({
        include: {
          items: {
            where: { userId },
            include: { location: true }
          }
        }
      })

      return categories.map(category => ({
        id: category.id,
        name: category.name,
        itemCount: category.items.length,
        totalValue: category.items.reduce((sum, item) => sum + (item.price || 0), 0),
        averageValue: category.items.length > 0 
          ? category.items.reduce((sum, item) => sum + (item.price || 0), 0) / category.items.length 
          : 0,
        locations: category.items.reduce((acc, item) => {
          const locationName = item.location.name
          acc[locationName] = (acc[locationName] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        recentActivity: category.items.filter(item => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(item.createdAt) > weekAgo
        }).length
      }))
    }),

  // Get location analytics
  getLocationAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session?.user?.id || ctx.user?.id
      if (!userId) throw new Error('User not authenticated')

      const locations = await db.location.findMany({
        where: { userId },
        include: {
          items: {
            include: { category: true }
          },
          children: true
        }
      })

      return locations.map(location => ({
        id: location.id,
        name: location.name,
        type: location.type,
        itemCount: location.items.length,
        totalValue: location.items.reduce((sum, item) => sum + (item.price || 0), 0),
        categories: location.items.reduce((acc, item) => {
          const categoryName = item.category?.name || 'Ukategorisert'
          acc[categoryName] = (acc[categoryName] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        utilization: location.items.length / Math.max(1, 10), // Assume max 10 items per location for utilization calc
        hasChildren: location.children.length > 0,
        childCount: location.children.length
      }))
    }),

  // Get activity insights
  getActivityInsights: protectedProcedure
    .input(z.object({
      days: z.number().default(30)
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || ctx.user?.id
      if (!userId) throw new Error('User not authenticated')
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)

      const activities = await db.activity.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Group by action type
      const actionTypes = activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Daily activity
      const dailyActivity = activities.reduce((acc, activity) => {
        const date = new Date(activity.createdAt).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Most active hours
      const hourlyActivity = activities.reduce((acc, activity) => {
        const hour = new Date(activity.createdAt).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      return {
        totalActivities: activities.length,
        actionTypes,
        dailyActivity,
        hourlyActivity,
        averagePerDay: activities.length / input.days,
        mostActiveDay: Object.entries(dailyActivity).sort(([,a], [,b]) => b - a)[0]?.[0] || null,
        mostActiveHour: Object.entries(hourlyActivity).sort(([,a], [,b]) => b - a)[0]?.[0] || null
      }
    }),

  // Export data for reports
  getExportData: protectedProcedure
    .input(z.object({
      includeImages: z.boolean().default(false),
      format: z.enum(['json', 'csv']).default('json')
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || ctx.user?.id
      if (!userId) throw new Error('User not authenticated')

      const items = await db.item.findMany({
        where: { userId },
        include: {
          category: true,
          location: true,
          tags: true
        }
      })

      const exportData = items.map(item => ({
        id: item.id,
        navn: item.name,
        beskrivelse: item.description,
        antall: item.totalQuantity,
        kategori: item.category?.name || 'Ukategorisert',
        lokasjon: item.location.name,
        pris: item.price,
        kjøpsdato: item.purchaseDate?.toISOString().split('T')[0],
        utløpsdato: item.expiryDate?.toISOString().split('T')[0],
        strekkode: item.barcode,
        tags: item.tags.map(tag => tag.name).join(', '),
        registrert: item.createdAt.toISOString().split('T')[0],
        oppdatert: item.updatedAt.toISOString().split('T')[0],
        ...(input.includeImages && { bildeUrl: item.imageUrl }),
        ...(item.categoryData ? JSON.parse(item.categoryData) : {}) // Include category-specific fields
      }))

      return {
        data: exportData,
        metadata: {
          exportedAt: new Date().toISOString(),
          totalItems: exportData.length,
          userId,
          format: input.format
        }
      }
    })
})
