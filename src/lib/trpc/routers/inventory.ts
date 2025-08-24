import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const inventoryRouter = createTRPCRouter({
  // Get low stock items
  getLowStockItems: protectedProcedure
    .input(z.object({
      threshold: z.number().min(0).default(3)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const items = await ctx.db.item.findMany({
          where: {
            userId: ctx.user.id,
            availableQuantity: {
              lte: input.threshold
            }
          },
          include: {
            location: true,
            category: true
          },
          orderBy: {
            availableQuantity: 'asc'
          }
        })

        return items.map(item => ({
          id: item.id,
          name: item.name,
          availableQuantity: item.availableQuantity,
          totalQuantity: item.totalQuantity,
          location: item.location,
          category: item.category,
          lastUpdated: item.updatedAt
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente gjenstander med lavt lager'
        })
      }
    }),

  // Get expiring items
  getExpiringItems: protectedProcedure
    .input(z.object({
      days: z.number().min(1).default(7)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() + input.days)

        const items = await ctx.db.item.findMany({
          where: {
            userId: ctx.user.id,
            expiryDate: {
              not: null,
              lte: cutoffDate
            }
          },
          include: {
            location: true
          },
          orderBy: {
            expiryDate: 'asc'
          }
        })

        return items.map(item => {
          const expiryDate = item.expiryDate as Date
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

          return {
            id: item.id,
            name: item.name,
            expiryDate: expiryDate.toLocaleDateString('no-NO'),
            daysUntilExpiry,
            availableQuantity: item.availableQuantity,
            location: item.location
          }
        })
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente gjenstander som utløper'
        })
      }
    }),

  // Get stock predictions
  getStockPredictions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get recent usage patterns
        const recentActivities = await ctx.db.activity.findMany({
          where: {
            userId,
            type: 'ITEM_USED',
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          include: {
            item: true
          }
        })

        // Calculate predicted usage
        const usageByItem = recentActivities.reduce((acc, activity) => {
          const itemName = activity.item?.name || 'Unknown'
          acc[itemName] = (acc[itemName] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const predictedUsage = Object.values(usageByItem).reduce((sum, count) => sum + count, 0)
        const itemsToRestock = Object.keys(usageByItem).length
        const estimatedCost = itemsToRestock * 50 // Simplified cost estimation

        return {
          predictedUsage,
          itemsToRestock,
          estimatedCost,
          usageByItem
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente lagerprediksjoner'
        })
      }
    }),

  // Get shopping list
  getShoppingList: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get low stock items
        const lowStockItems = await ctx.db.item.findMany({
          where: {
            userId,
            availableQuantity: {
              lte: 3
            }
          },
          include: {
            location: true
          }
        })

        // Get expiring items that need replacement
        const expiringItems = await ctx.db.item.findMany({
          where: {
            userId,
            expiryDate: {
              not: null,
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        })

        // Generate shopping list items
        const shoppingItems = [
          ...lowStockItems.map(item => ({
            name: item.name,
            recommendedQuantity: Math.max(1, 5 - (item.availableQuantity || 0)),
            estimatedPrice: item.price ? Number(item.price) : 50,
            priority: 'high' as const,
            reason: 'Lavt lager'
          })),
          ...expiringItems.map(item => ({
            name: item.name,
            recommendedQuantity: 1,
            estimatedPrice: item.price ? Number(item.price) : 50,
            priority: 'medium' as const,
            reason: 'Utløper snart'
          }))
        ]

        // Remove duplicates and calculate total
        const uniqueItems = shoppingItems.reduce((acc, item) => {
          const existing = acc.find(i => i.name === item.name)
          if (existing) {
            existing.recommendedQuantity += item.recommendedQuantity
            existing.estimatedPrice = Math.max(existing.estimatedPrice, item.estimatedPrice)
            existing.priority = existing.priority === 'high' || item.priority === 'high' ? 'high' : 'medium'
          } else {
            acc.push(item)
          }
          return acc
        }, [] as typeof shoppingItems)

        const totalEstimatedCost = uniqueItems.reduce((sum, item) => 
          sum + (item.estimatedPrice * item.recommendedQuantity), 0
        )

        return {
          items: uniqueItems,
          totalEstimatedCost,
          itemCount: uniqueItems.length
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke generere handleliste'
        })
      }
    }),

  // Update stock
  updateStock: protectedProcedure
    .input(z.object({
      itemId: z.string(),
      quantity: z.number().min(1),
      action: z.enum(['restock', 'use', 'adjust'])
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const item = await ctx.db.item.findFirst({
          where: {
            id: input.itemId,
            userId: ctx.user.id
          }
        })

        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Gjenstand ikke funnet'
          })
        }

        let newAvailableQuantity = item.availableQuantity || 0

        switch (input.action) {
          case 'restock':
            newAvailableQuantity += input.quantity
            break
          case 'use':
            newAvailableQuantity = Math.max(0, newAvailableQuantity - input.quantity)
            break
          case 'adjust':
            newAvailableQuantity = input.quantity
            break
        }

        const updatedItem = await ctx.db.item.update({
          where: { id: input.itemId },
          data: {
            availableQuantity: newAvailableQuantity,
            totalQuantity: input.action === 'restock' 
              ? (item.totalQuantity || 0) + input.quantity 
              : item.totalQuantity
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'STOCK_UPDATED',
            description: `${input.action === 'restock' ? 'Påfylt' : 'Brukte'} ${input.quantity} av ${item.name}`,
            userId: ctx.user.id,
            itemId: item.id,
            metadata: {
              action: input.action,
              quantity: input.quantity,
              previousQuantity: item.availableQuantity,
              newQuantity: newAvailableQuantity
            }
          }
        })

        return updatedItem
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere lager'
        })
      }
    }),

  // Generate shopping list
  generateShoppingList: protectedProcedure
    .input(z.object({
      includeLowStock: z.boolean().default(true),
      includeExpiring: z.boolean().default(true),
      maxItems: z.number().min(1).max(50).default(20)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Get items based on criteria
        const whereConditions = []

        if (input.includeLowStock) {
          whereConditions.push({
            availableQuantity: { lte: 3 }
          })
        }

        if (input.includeExpiring) {
          whereConditions.push({
            expiryDate: {
              not: null,
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          })
        }

        const items = await ctx.db.item.findMany({
          where: {
            userId,
            OR: whereConditions
          },
          include: {
            location: true
          },
          take: input.maxItems
        })

        // Create shopping list
        const shoppingList = await ctx.db.shoppingList.create({
          data: {
            userId,
            name: `Handleliste ${new Date().toLocaleDateString('no-NO')}`,
            items: items.map(item => ({
              name: item.name,
              quantity: Math.max(1, 5 - (item.availableQuantity || 0)),
              estimatedPrice: item.price ? Number(item.price) : 50
            }))
          }
        })

        return shoppingList
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke generere handleliste'
        })
      }
    }),

  // Get inventory health score
  getInventoryHealth: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        const [totalItems, lowStockItems, expiringItems, unusedItems] = await Promise.all([
          ctx.db.item.count({ where: { userId } }),
          ctx.db.item.count({ 
            where: { 
              userId, 
              availableQuantity: { lte: 3 } 
            } 
          }),
          ctx.db.item.count({ 
            where: { 
              userId, 
              expiryDate: { 
                not: null, 
                lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
              } 
            } 
          }),
          ctx.db.item.count({ 
            where: { 
              userId, 
              updatedAt: { 
                lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
              } 
            } 
          })
        ])

        // Calculate health score (0-100)
        let healthScore = 100

        if (totalItems > 0) {
          healthScore -= (lowStockItems / totalItems) * 30
          healthScore -= (expiringItems / totalItems) * 25
          healthScore -= (unusedItems / totalItems) * 20
        }

        healthScore = Math.max(0, Math.min(100, healthScore))

        return {
          healthScore: Math.round(healthScore),
          totalItems,
          lowStockItems,
          expiringItems,
          unusedItems,
          recommendations: generateRecommendations(lowStockItems, expiringItems, unusedItems)
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke beregne inventarhelse'
        })
      }
    })
})

function generateRecommendations(lowStock: number, expiring: number, unused: number) {
  const recommendations = []

  if (lowStock > 0) {
    recommendations.push({
      type: 'restock',
      priority: 'high',
      message: `${lowStock} gjenstander trenger påfyll`
    })
  }

  if (expiring > 0) {
    recommendations.push({
      type: 'expiry',
      priority: 'high',
      message: `${expiring} gjenstander utløper snart`
    })
  }

  if (unused > 0) {
    recommendations.push({
      type: 'unused',
      priority: 'medium',
      message: `${unused} gjenstander har ikke blitt brukt på 90 dager`
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'good',
      priority: 'low',
      message: 'Inventaret ditt er i god stand!'
    })
  }

  return recommendations
}
