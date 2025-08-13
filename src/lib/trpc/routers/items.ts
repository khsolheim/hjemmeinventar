// Items tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { logActivity } from '../../db'
import { inventoryEvents } from '../../inngest/services/inventory-events'
import { emitToHousehold } from '../../websocket/server'

export const itemsRouter = createTRPCRouter({
  // Get all items for user
  getAll: protectedProcedure
    .input(z.object({
      locationId: z.string().optional(),
      categoryId: z.string().optional(),
      search: z.string().optional(),
      filter: z.enum(['available', 'loaned']).optional(),
      limit: z.number().min(1).max(10000).optional(),
      offset: z.number().min(0).optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      // Ensure input is defined
      const safeInput = input || {}
      const where: any = {
        userId: ctx.user.id
      }
      
      if (safeInput.locationId) {
        where.locationId = safeInput.locationId
      }
      
      if (safeInput.categoryId) {
        where.categoryId = safeInput.categoryId
      }
      
      if (safeInput.search) {
        where.OR = [
          { name: { contains: safeInput.search } },
          { description: { contains: safeInput.search } },
          { brand: { contains: safeInput.search } }
        ]
      }
      
      if (safeInput.filter === 'available') {
        where.loan = null // Items without active loans
      } else if (safeInput.filter === 'loaned') {
        where.loan = {
          status: 'OUT'
        }
      }
      
      const limit = safeInput.limit || 50
      const offset = safeInput.offset || 0
      
      const [items, total] = await Promise.all([
        ctx.db.item.findMany({
          where,
          include: {
            location: {
              include: {
                parent: true
              }
            },
            category: true,
            tags: true,
            attachments: true,
            loan: true, // Include loan info for filtering
            distributions: {
              include: {
                location: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
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
      imageUrl: z.string().optional(), // Legacy single image support
      images: z.array(z.string()).optional(), // New multiple images support
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
          name: input.name,
          description: input.description,
          totalQuantity: input.totalQuantity,
          unit: input.unit,
          locationId: input.locationId,
          categoryId: input.categoryId,
          imageUrl: input.imageUrl,
          purchaseDate: input.purchaseDate,
          expiryDate: input.expiryDate,
          price: input.price,
          barcode: input.barcode,
          brand: input.brand,
          categoryData: input.categoryData ? JSON.stringify(input.categoryData) : undefined,
          userId: ctx.user.id,
          availableQuantity: input.totalQuantity,
          consumedQuantity: 0
        },
        include: {
          location: true,
          category: true,
          attachments: true
        }
      })

      // Create attachments for images
      if (input.images && input.images.length > 0) {
        await Promise.all(
          input.images.map(async (imageUrl) => {
            // Extract filename from URL
            const urlParts = imageUrl.split('/')
            const filename = urlParts[urlParts.length - 1] || 'image.jpg'
            
            return ctx.db.attachment.create({
              data: {
                url: imageUrl,
                filename,
                filetype: 'image',
                filesize: 0, // We don't have size info from URL
                itemId: item.id
              }
            })
          })
        )
      }
      
      // Log activity
      await logActivity({
        type: 'ITEM_CREATED',
        description: `Opprettet ${item.name}`,
        userId: ctx.user.id,
        itemId: item.id,
        locationId: item.locationId
      })
      
      // Trigger background jobs
      await inventoryEvents.onItemCreated({
        itemId: item.id,
        userId: ctx.user.id,
        categoryId: item.categoryId || undefined,
        locationId: item.locationId,
        expiryDate: item.expiryDate || undefined
      })
      
      // Emit WebSocket event to household members
      try {
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          include: {
            households: {
              include: { household: true }
            }
          }
        })
        
        if (user?.households) {
          user.households.forEach(membership => {
            emitToHousehold(membership.householdId, 'item:created', {
              item,
              householdId: membership.householdId,
              createdBy: {
                id: user.id,
                name: user.name,
                email: user.email,
                householdIds: user.households.map(h => h.householdId)
              }
            })
          })
        }
      } catch (error) {
        console.error('Failed to emit WebSocket event:', error)
        // Don't fail the mutation if WebSocket fails
      }
      
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
      
      // Process categoryData for string storage
      const processedUpdateData = {
        ...updateData,
        categoryData: updateData.categoryData 
          ? JSON.stringify(updateData.categoryData) 
          : updateData.categoryData
      }

      const item = await ctx.db.item.update({
        where: { id },
        data: processedUpdateData,
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
      
      // Trigger background jobs
      await inventoryEvents.onItemUpdated({
        itemId: item.id,
        userId: ctx.user.id,
        changes: updateData,
        oldValues: {
          name: existingItem.name,
          locationId: existingItem.locationId,
          categoryId: existingItem.categoryId,
          expiryDate: existingItem.expiryDate,
          price: existingItem.price
        }
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
      
      // Trigger background jobs
      await inventoryEvents.onItemDeleted({
        itemId: item.id,
        userId: ctx.user.id
      })
      
      return { success: true }
    }),

  // Add item distribution (split quantity across locations)
  addDistribution: protectedProcedure
    .input(z.object({
      itemId: z.string(),
      locationId: z.string(),
      quantity: z.number().min(0.0001),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findFirst({
        where: { id: input.itemId, userId: ctx.user.id },
        include: { distributions: true }
      })
      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Gjenstand ikke funnet' })
      }

      const location = await ctx.db.location.findFirst({
        where: { id: input.locationId, userId: ctx.user.id }
      })
      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lokasjon ikke funnet' })
      }

      const currentTotalDistributed = item.distributions.reduce((sum, d) => sum + Number(d.quantity || 0), 0)
      if (currentTotalDistributed + input.quantity > item.totalQuantity + 1e-6) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Fordelt mengde kan ikke overstige totalt antall' })
      }

      const created = await ctx.db.itemDistribution.create({
        data: {
          itemId: item.id,
          locationId: location.id,
          quantity: input.quantity,
          notes: input.notes
        },
        include: { location: true }
      })

      await logActivity({
        type: 'ITEM_MOVED',
        description: `La til fordeling (${input.quantity} ${item.unit}) til ${location.name}`,
        userId: ctx.user.id,
        itemId: item.id,
        locationId: location.id
      })

      return created
    }),

  // Update item distribution
  updateDistribution: protectedProcedure
    .input(z.object({
      distributionId: z.string(),
      locationId: z.string().optional(),
      quantity: z.number().min(0.0001).optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const distribution = await ctx.db.itemDistribution.findFirst({
        where: { id: input.distributionId },
        include: { item: { include: { distributions: true } } }
      })
      if (!distribution || distribution.item.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Fordeling ikke funnet' })
      }

      if (input.locationId) {
        const location = await ctx.db.location.findFirst({
          where: { id: input.locationId, userId: ctx.user.id }
        })
        if (!location) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Ny lokasjon ikke funnet' })
        }
      }

      // Validate total does not exceed item.totalQuantity
      if (input.quantity !== undefined) {
        const othersTotal = distribution.item.distributions
          .filter(d => d.id !== distribution.id)
          .reduce((sum, d) => sum + Number(d.quantity || 0), 0)
        if (othersTotal + input.quantity > distribution.item.totalQuantity + 1e-6) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Fordelt mengde kan ikke overstige totalt antall' })
        }
      }

      const updated = await ctx.db.itemDistribution.update({
        where: { id: input.distributionId },
        data: {
          ...(input.locationId !== undefined ? { locationId: input.locationId } : {}),
          ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {})
        },
        include: { location: true }
      })

      await logActivity({
        type: 'ITEM_MOVED',
        description: `Oppdaterte fordeling (${updated.quantity} ${distribution.item.unit}) i ${updated.locationId === distribution.locationId ? 'samme lokasjon' : 'ny lokasjon'}`,
        userId: ctx.user.id,
        itemId: distribution.itemId,
        locationId: updated.locationId
      })

      return updated
    }),

  // Remove item distribution
  removeDistribution: protectedProcedure
    .input(z.object({ distributionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const distribution = await ctx.db.itemDistribution.findFirst({
        where: { id: input.distributionId },
        include: { item: true, location: true }
      })
      if (!distribution || distribution.item.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Fordeling ikke funnet' })
      }

      await ctx.db.itemDistribution.delete({ where: { id: input.distributionId } })

      await logActivity({
        type: 'ITEM_MOVED',
        description: `Fjernet fordeling (${distribution.quantity} ${distribution.item.unit}) fra ${distribution.location.name}`,
        userId: ctx.user.id,
        itemId: distribution.itemId,
        locationId: distribution.locationId
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
    }),

  // Bulk delete items
  bulkDelete: protectedProcedure
    .input(z.array(z.string()).min(1))
    .mutation(async ({ ctx, input }) => {
      // Verify all items belong to user
      const items = await ctx.db.item.findMany({
        where: {
          id: { in: input },
          userId: ctx.user.id
        },
        select: {
          id: true,
          name: true
        }
      })
      
      if (items.length !== input.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'En eller flere gjenstander ble ikke funnet'
        })
      }
      
      // Delete items
      const result = await ctx.db.item.deleteMany({
        where: {
          id: { in: input },
          userId: ctx.user.id
        }
      })
      
      // Log bulk delete activity
      await logActivity({
        type: 'BULK_OPERATION',
        description: `Slettet ${result.count} gjenstander: ${items.map(i => i.name).join(', ')}`,
        userId: ctx.user.id,
        metadata: {
          operation: 'DELETE',
          itemCount: result.count,
          itemIds: input,
          itemNames: items.map(i => i.name)
        }
      })
      
      return { 
        success: true, 
        deletedCount: result.count,
        deletedItems: items
      }
    })
})
