// Activities tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'

export const activitiesRouter = createTRPCRouter({
  // Get user's recent activities
  getRecent: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      type: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.user.id
      }
      
      if (input.type) {
        where.type = input.type
      }
      
      const [activities, total] = await Promise.all([
        ctx.db.activity.findMany({
          where,
          include: {
            item: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            },
            location: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.activity.count({ where })
      ])
      
      return { activities, total }
    }),

  // Get activities for specific item
  getForItem: protectedProcedure
    .input(z.object({
      itemId: z.string(),
      limit: z.number().min(1).max(50).default(10)
    }))
    .query(async ({ ctx, input }) => {
      const activities = await ctx.db.activity.findMany({
        where: {
          itemId: input.itemId,
          userId: ctx.user.id
        },
        include: {
          location: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit
      })
      
      return activities
    }),

  // Get activities for specific location
  getForLocation: protectedProcedure
    .input(z.object({
      locationId: z.string(),
      limit: z.number().min(1).max(50).default(10)
    }))
    .query(async ({ ctx, input }) => {
      const activities = await ctx.db.activity.findMany({
        where: {
          locationId: input.locationId,
          userId: ctx.user.id
        },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit
      })
      
      return activities
    }),

  // Get activity statistics
  getStats: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(365).default(30)
    }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)
      
      // Activity counts by type
      const activityCounts = await ctx.db.activity.groupBy({
        by: ['type'],
        where: {
          userId: ctx.user.id,
          createdAt: { gte: startDate }
        },
        _count: true
      })
      
      // Daily activity counts
      const dailyActivities = await ctx.db.activity.findMany({
        where: {
          userId: ctx.user.id,
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true,
          type: true
        },
        orderBy: { createdAt: 'asc' }
      })
      
      // Group by day
      const dailyStats = dailyActivities.reduce((acc, activity) => {
        const date = activity.createdAt.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { total: 0, byType: {} }
        }
        acc[date].total++
        acc[date].byType[activity.type] = (acc[date].byType[activity.type] || 0) + 1
        return acc
      }, {} as Record<string, { total: number; byType: Record<string, number> }>)
      
      const totalActivities = activityCounts.reduce((sum, item) => sum + item._count, 0)
      const averagePerDay = input.days > 0 ? Math.round(totalActivities / input.days) : 0
      
      return {
        totalActivities,
        averagePerDay,
        activityCounts: activityCounts.map(item => ({
          type: item.type,
          count: item._count
        })),
        dailyStats
      }
    }),

  // Get activity feed with smart grouping
  getFeed: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const activities = await ctx.db.activity.findMany({
        where: { userId: ctx.user.id },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              category: {
                select: {
                  name: true,
                  icon: true
                }
              }
            }
          },
          location: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset
      })
      
      // Group activities by day and similar actions
      const groupedActivities = activities.reduce((acc, activity) => {
        const date = activity.createdAt.toISOString().split('T')[0]
        
        if (!acc[date]) {
          acc[date] = []
        }
        
        acc[date].push(activity)
        return acc
      }, {} as Record<string, typeof activities>)
      
      // Convert to array format with day headers
      const feed = Object.entries(groupedActivities).map(([date, dayActivities]) => ({
        date,
        activities: dayActivities,
        count: dayActivities.length
      }))
      
      return feed
    }),

  // Delete old activities (cleanup)
  cleanup: protectedProcedure
    .input(z.object({
      olderThanDays: z.number().min(30).default(365)
    }))
    .mutation(async ({ ctx, input }) => {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - input.olderThanDays)
      
      const result = await ctx.db.activity.deleteMany({
        where: {
          userId: ctx.user.id,
          createdAt: { lt: cutoffDate }
        }
      })
      
      return {
        deletedCount: result.count,
        message: `Slettet ${result.count} aktiviteter eldre enn ${input.olderThanDays} dager`
      }
    })
})
