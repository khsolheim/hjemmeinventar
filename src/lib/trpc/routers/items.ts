// Items tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { logActivity } from '../../db'

export const itemsRouter = createTRPCRouter({
  // Get all items for user
  getAll: protectedProcedure
    .input(z.object({
      locationId: z.string().optional(),
      categoryId: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.user.id
      }
      
      if (input.locationId) {
        where.locationId = input.locationId
      }
      
      if (input.categoryId) {
        where.categoryId = input.categoryId
      }
      
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
          { brand: { contains: input.search, mode: 'insensitive' } }
        ]
      }
      
      const [items, total] = await Promise.all([
        ctx.db.item.findMany({
          where,
          include: {
            location: true,
            category: true,
            tags: true,
            distributions: {
              include: {
                location: true
              }
            },
            loan: true
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.item.count({ where })
      ])
      
      return { items, total }
    }),

  // Get single item by ID
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.item.findFirst({
        where: { 
          id: input,
          userId: ctx.user.id 
        },
        include: {
          location: true,
          category: true,
          tags: true,
          distributions: {
            include: {
              location: true
            }
          },
          loan: true,
          attachments: true,
          relatedItems: true,
          relatedTo: true,
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })
      
      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Gjenstand ikke funnet'
        })
      }
      
      return item
    }),

  // Create new item
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      totalQuantity: z.number().min(1).default(1),
      unit: z.string().default('stk'),
      locationId: z.string(),
      categoryId: z.string().optional(),
      imageUrl: z.string().optional(),
      purchaseDate: z.date().optional(),
      expiryDate: z.date().optional(),
      price: z.number().optional(),
      barcode: z.string().optional(),
      brand: z.string().optional(),
      categoryData: z.any().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify location belongs to user
      const location = await ctx.db.location.findFirst({
        where: {
          id: input.locationId,
          userId: ctx.user.id
        }
      })
      
      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lokasjon ikke funnet'
        })
      }
      
      const item = await ctx.db.item.create({
        data: {
          ...input,
          userId: ctx.user.id,
          availableQuantity: input.totalQuantity,
          consumedQuantity: 0
        },
        include: {
          location: true,
          category: true
        }
      })
      
      // Log activity
      await logActivity({
        type: 'ITEM_CREATED',
        description: `Opprettet ${item.name}`,
        userId: ctx.user.id,
        itemId: item.id,
        locationId: item.locationId
      })
      
      return item
    }),

  // Update item
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      totalQuantity: z.number().min(1).optional(),
      availableQuantity: z.number().min(0).optional(),
      consumedQuantity: z.number().min(0).optional(),
      unit: z.string().optional(),
      locationId: z.string().optional(),
      categoryId: z.string().optional(),
      imageUrl: z.string().optional(),
      purchaseDate: z.date().optional(),
      expiryDate: z.date().optional(),
      price: z.number().optional(),
      barcode: z.string().optional(),
      brand: z.string().optional(),
      categoryData: z.any().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      
      // Verify item belongs to user
      const existingItem = await ctx.db.item.findFirst({
        where: { 
          id,
          userId: ctx.user.id 
        }
      })
      
      if (!existingItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Gjenstand ikke funnet'
        })
      }
      
      // If location is being changed, verify new location
      if (updateData.locationId) {
        const location = await ctx.db.location.findFirst({
          where: {
            id: updateData.locationId,
            userId: ctx.user.id
          }
        })
        
        if (!location) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ny lokasjon ikke funnet'
          })
        }
      }
      
      const item = await ctx.db.item.update({
        where: { id },
        data: updateData,
        include: {
          location: true,
          category: true,
          tags: true
        }
      })
      
      // Log activity
      await logActivity({
        type: 'ITEM_UPDATED',
        description: `Oppdaterte ${item.name}`,
        userId: ctx.user.id,
        itemId: item.id,
        locationId: item.locationId
      })
      
      return item
    }),

  // Delete item
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findFirst({
        where: { 
          id: input,
          userId: ctx.user.id 
        }
      })
      
      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Gjenstand ikke funnet'
        })
      }
      
      await ctx.db.item.delete({
        where: { id: input }
      })
      
      // Log activity
      await logActivity({
        type: 'ITEM_DELETED',
        description: `Slettet ${item.name}`,
        userId: ctx.user.id,
        locationId: item.locationId
      })
      
      return { success: true }
    }),

  // Bulk operations
  bulkMove: protectedProcedure
    .input(z.object({
      itemIds: z.array(z.string()),
      locationId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify all items belong to user
      const items = await ctx.db.item.findMany({
        where: {
          id: { in: input.itemIds },
          userId: ctx.user.id
        }
      })
      
      if (items.length !== input.itemIds.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'En eller flere gjenstander ikke funnet'
        })
      }
      
      // Verify target location
      const location = await ctx.db.location.findFirst({
        where: {
          id: input.locationId,
          userId: ctx.user.id
        }
      })
      
      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Målokasjon ikke funnet'
        })
      }
      
      // Perform bulk update
      await ctx.db.item.updateMany({
        where: {
          id: { in: input.itemIds },
          userId: ctx.user.id
        },
        data: {
          locationId: input.locationId
        }
      })
      
      // Log bulk activity
      await logActivity({
        type: 'BULK_OPERATION',
        description: `Flyttet ${items.length} gjenstander til ${location.name}`,
        userId: ctx.user.id,
        locationId: input.locationId,
        metadata: { 
          operation: 'MOVE',
          itemCount: items.length,
          itemIds: input.itemIds
        }
      })
      
      return { success: true, movedCount: items.length }
    }),

  // Update quantity (consume/use item)
  updateQuantity: protectedProcedure
    .input(z.object({
      id: z.string(),
      consumedQuantity: z.number().min(0),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findFirst({
        where: { 
          id: input.id,
          userId: ctx.user.id 
        }
      })
      
      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Gjenstand ikke funnet'
        })
      }
      
      // Validate new consumed quantity
      if (input.consumedQuantity > item.totalQuantity) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kan ikke bruke mer enn totalt antall'
        })
      }
      
      const newAvailableQuantity = item.totalQuantity - input.consumedQuantity
      
      const updatedItem = await ctx.db.item.update({
        where: { id: input.id },
        data: {
          consumedQuantity: input.consumedQuantity,
          availableQuantity: newAvailableQuantity
        }
      })
      
      // Log activity
      const quantityDiff = input.consumedQuantity - Number(item.consumedQuantity)
      if (quantityDiff > 0) {
        await logActivity({
          type: 'ITEM_UPDATED',
          description: `Brukte ${quantityDiff} ${item.unit} av ${item.name}${input.notes ? ` - ${input.notes}` : ''}`,
          userId: ctx.user.id,
          itemId: item.id,
          metadata: {
            quantityChange: quantityDiff,
            newAvailable: newAvailableQuantity,
            notes: input.notes
          }
        })
      }
      
      return updatedItem
    })
})
