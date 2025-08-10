// Tags tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const tagsRouter = createTRPCRouter({
  // Get all tags for user
  getUserTags: protectedProcedure
    .query(async ({ ctx }) => {
      const tags = await ctx.db.tag.findMany({
        where: { userId: ctx.user.id },
        include: {
          _count: {
            select: { items: true }
          }
        },
        orderBy: { name: 'asc' }
      })
      
      return tags
    }),

  // Get tag by ID
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findFirst({
        where: {
          id: input,
          userId: ctx.user.id
        },
        include: {
          items: {
            include: {
              location: true,
              category: true
            },
            orderBy: { name: 'asc' }
          },
          _count: {
            select: { items: true }
          }
        }
      })
      
      if (!tag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag ikke funnet'
        })
      }
      
      return tag
    }),

  // Create new tag
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6B7280')
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if tag name already exists for user
      const existing = await ctx.db.tag.findFirst({
        where: {
          name: input.name,
          userId: ctx.user.id
        }
      })
      
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Du har allerede en tag med dette navnet'
        })
      }
      
      const tag = await ctx.db.tag.create({
        data: {
          ...input,
          userId: ctx.user.id
        }
      })
      
      return tag
    }),

  // Update tag
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(50).optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      
      // Verify tag belongs to user
      const existingTag = await ctx.db.tag.findFirst({
        where: {
          id,
          userId: ctx.user.id
        }
      })
      
      if (!existingTag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag ikke funnet'
        })
      }
      
      // Check if new name conflicts with existing tag
      if (updateData.name && updateData.name !== existingTag.name) {
        const nameConflict = await ctx.db.tag.findFirst({
          where: {
            name: updateData.name,
            userId: ctx.user.id,
            id: { not: id }
          }
        })
        
        if (nameConflict) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Du har allerede en tag med dette navnet'
          })
        }
      }
      
      const tag = await ctx.db.tag.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: { items: true }
          }
        }
      })
      
      return tag
    }),

  // Delete tag
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findFirst({
        where: {
          id: input,
          userId: ctx.user.id
        },
        include: {
          _count: {
            select: { items: true }
          }
        }
      })
      
      if (!tag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag ikke funnet'
        })
      }
      
      await ctx.db.tag.delete({
        where: { id: input }
      })
      
      return {
        success: true,
        message: `Slettet tag "${tag.name}" (var brukt på ${tag._count.items} gjenstander)`
      }
    }),

  // Add tag to item
  addToItem: protectedProcedure
    .input(z.object({
      tagId: z.string(),
      itemId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify tag belongs to user
      const tag = await ctx.db.tag.findFirst({
        where: {
          id: input.tagId,
          userId: ctx.user.id
        }
      })
      
      if (!tag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag ikke funnet'
        })
      }
      
      // Verify item belongs to user
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
      
      // Add tag to item (using connect)
      const updatedItem = await ctx.db.item.update({
        where: { id: input.itemId },
        data: {
          tags: {
            connect: { id: input.tagId }
          }
        },
        include: {
          tags: true
        }
      })
      
      return {
        success: true,
        message: `La til tag "${tag.name}" på ${item.name}`
      }
    }),

  // Remove tag from item
  removeFromItem: protectedProcedure
    .input(z.object({
      tagId: z.string(),
      itemId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify item belongs to user
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
      
      // Remove tag from item
      const updatedItem = await ctx.db.item.update({
        where: { id: input.itemId },
        data: {
          tags: {
            disconnect: { id: input.tagId }
          }
        },
        include: {
          tags: true
        }
      })
      
      return {
        success: true,
        message: 'Tag fjernet fra gjenstand'
      }
    }),

  // Get tags for specific item
  getItemTags: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.item.findFirst({
        where: {
          id: input,
          userId: ctx.user.id
        },
        include: {
          tags: {
            orderBy: { name: 'asc' }
          }
        }
      })
      
      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Gjenstand ikke funnet'
        })
      }
      
      return item.tags
    }),

  // Get popular tags (most used)
  getPopular: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(10)
    }))
    .query(async ({ ctx, input }) => {
      const tags = await ctx.db.tag.findMany({
        where: { userId: ctx.user.id },
        include: {
          _count: {
            select: { items: true }
          }
        },
        orderBy: {
          items: {
            _count: 'desc'
          }
        },
        take: input.limit
      })
      
      return tags.filter(tag => tag._count.items > 0)
    }),

  // Search tags by name
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(20)
    }))
    .query(async ({ ctx, input }) => {
      const tags = await ctx.db.tag.findMany({
        where: {
          userId: ctx.user.id,
          name: {
            contains: input.query,

          }
        },
        include: {
          _count: {
            select: { items: true }
          }
        },
        orderBy: { name: 'asc' },
        take: input.limit
      })
      
      return tags
    }),

  // Bulk add tags to items
  bulkAddToItems: protectedProcedure
    .input(z.object({
      tagId: z.string(),
      itemIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify tag belongs to user
      const tag = await ctx.db.tag.findFirst({
        where: {
          id: input.tagId,
          userId: ctx.user.id
        }
      })
      
      if (!tag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag ikke funnet'
        })
      }
      
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
      
      // Add tag to all items
      await Promise.all(
        input.itemIds.map(itemId =>
          ctx.db.item.update({
            where: { id: itemId },
            data: {
              tags: {
                connect: { id: input.tagId }
              }
            }
          })
        )
      )
      
      return {
        success: true,
        message: `La til tag "${tag.name}" på ${items.length} gjenstander`
      }
    }),

  // Get tag usage statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalTags,
        tagsWithItems,
        unusedTags,
        mostUsedTag
      ] = await Promise.all([
        ctx.db.tag.count({
          where: { userId: ctx.user.id }
        }),
        ctx.db.tag.count({
          where: {
            userId: ctx.user.id,
            items: {
              some: {}
            }
          }
        }),
        ctx.db.tag.findMany({
          where: {
            userId: ctx.user.id,
            items: {
              none: {}
            }
          },
          select: {
            id: true,
            name: true,
            color: true
          }
        }),
        ctx.db.tag.findFirst({
          where: { userId: ctx.user.id },
          include: {
            _count: {
              select: { items: true }
            }
          },
          orderBy: {
            items: {
              _count: 'desc'
            }
          }
        })
      ])
      
      return {
        totalTags,
        tagsWithItems,
        unusedTags,
        mostUsedTag,
        usageRate: totalTags > 0 ? Math.round((tagsWithItems / totalTags) * 100) : 0
      }
    })
})
