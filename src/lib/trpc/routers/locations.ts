// Locations tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { generateUniqueQRCode, logActivity } from '../../db'

export const locationsRouter = createTRPCRouter({
  // Get all locations for user (hierarchical tree)
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const locations = await ctx.db.location.findMany({
        where: { userId: ctx.user.id },
        include: {
          children: {
            include: {
              children: true,
              _count: { select: { items: true } }
            }
          },
          _count: { select: { items: true } }
        },
        orderBy: { name: 'asc' }
      })
      
      // Build hierarchical structure (root locations only)
      return locations.filter(loc => !loc.parentId)
    }),

  // Get location by ID with items
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const location = await ctx.db.location.findFirst({
        where: { 
          id: input,
          userId: ctx.user.id 
        },
        include: {
          parent: true,
          children: {
            include: {
              _count: { select: { items: true } }
            }
          },
          items: {
            include: {
              category: true,
              tags: true
            },
            orderBy: { name: 'asc' }
          },
          distributions: {
            include: {
              item: {
                include: {
                  category: true
                }
              }
            }
          },
          _count: { select: { items: true } }
        }
      })
      
      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lokasjon ikke funnet'
        })
      }
      
      return location
    }),

  // Get location by QR code
  getByQRCode: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const location = await ctx.db.location.findFirst({
        where: { 
          qrCode: input,
          userId: ctx.user.id 
        },
        include: {
          parent: true,
          items: {
            include: {
              category: true,
              tags: true
            },
            orderBy: { name: 'asc' }
          },
          _count: { select: { items: true } }
        }
      })
      
      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'QR-kode ikke funnet'
        })
      }
      
      // Log QR scan activity
      await logActivity({
        type: 'QR_SCANNED',
        description: `Skannet QR-kode for ${location.name}`,
        userId: ctx.user.id,
        locationId: location.id
      })
      
      return location
    }),

  // Create new location
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(['ROOM', 'SHELF', 'BOX', 'CONTAINER', 'DRAWER', 'CABINET']),
      parentId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify parent location if specified
      if (input.parentId) {
        const parent = await ctx.db.location.findFirst({
          where: {
            id: input.parentId,
            userId: ctx.user.id
          }
        })
        
        if (!parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Overordnet lokasjon ikke funnet'
          })
        }
      }
      
      // Generate unique QR code
      const qrCode = await generateUniqueQRCode()
      
      const location = await ctx.db.location.create({
        data: {
          ...input,
          qrCode,
          userId: ctx.user.id
        },
        include: {
          parent: true
        }
      })
      
      // Log activity
      await logActivity({
        type: 'LOCATION_CREATED',
        description: `Opprettet lokasjon ${location.name}`,
        userId: ctx.user.id,
        locationId: location.id
      })
      
      return location
    }),

  // Update location
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(['ROOM', 'SHELF', 'BOX', 'CONTAINER', 'DRAWER', 'CABINET']).optional(),
      parentId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      
      // Verify location belongs to user
      const existingLocation = await ctx.db.location.findFirst({
        where: { 
          id,
          userId: ctx.user.id 
        }
      })
      
      if (!existingLocation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lokasjon ikke funnet'
        })
      }
      
      // Verify new parent if specified
      if (updateData.parentId) {
        // Can't set self as parent
        if (updateData.parentId === id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'En lokasjon kan ikke være sin egen overordnede'
          })
        }
        
        const parent = await ctx.db.location.findFirst({
          where: {
            id: updateData.parentId,
            userId: ctx.user.id
          }
        })
        
        if (!parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Ny overordnet lokasjon ikke funnet'
          })
        }
      }
      
      const location = await ctx.db.location.update({
        where: { id },
        data: updateData,
        include: {
          parent: true,
          children: true
        }
      })
      
      return location
    }),

  // Delete location (with validation)
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const location = await ctx.db.location.findFirst({
        where: { 
          id: input,
          userId: ctx.user.id 
        },
        include: {
          items: true,
          children: true
        }
      })
      
      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lokasjon ikke funnet'
        })
      }
      
      // Check if location has items
      if (location.items.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Kan ikke slette lokasjon med ${location.items.length} gjenstand(er). Flytt eller slett gjenstandene først.`
        })
      }
      
      // Check if location has children
      if (location.children.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Kan ikke slette lokasjon med ${location.children.length} underlokasjon(er). Slett underlokasjoner først.`
        })
      }
      
      await ctx.db.location.delete({
        where: { id: input }
      })
      
      return { success: true }
    }),

  // Get location statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const stats = await ctx.db.location.findMany({
        where: { userId: ctx.user.id },
        include: {
          _count: {
            select: {
              items: true,
              children: true
            }
          }
        }
      })
      
      const totalLocations = stats.length
      const totalItems = stats.reduce((sum, loc) => sum + loc._count.items, 0)
      const roomCount = stats.filter(loc => loc.type === 'ROOM').length
      const containerCount = stats.filter(loc => 
        ['BOX', 'CONTAINER', 'DRAWER'].includes(loc.type)
      ).length
      
      return {
        totalLocations,
        totalItems,
        roomCount,
        containerCount,
        averageItemsPerLocation: totalLocations > 0 ? Math.round(totalItems / totalLocations) : 0
      }
    }),

  // Generate new QR code for location
  regenerateQRCode: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const location = await ctx.db.location.findFirst({
        where: { 
          id: input,
          userId: ctx.user.id 
        }
      })
      
      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lokasjon ikke funnet'
        })
      }
      
      const newQRCode = await generateUniqueQRCode()
      
      const updatedLocation = await ctx.db.location.update({
        where: { id: input },
        data: { qrCode: newQRCode }
      })
      
      // Log activity
      await logActivity({
        type: 'LOCATION_UPDATED',
        description: `Genererte ny QR-kode for ${location.name}`,
        userId: ctx.user.id,
        locationId: location.id,
        metadata: {
          oldQRCode: location.qrCode,
          newQRCode: newQRCode
        }
      })
      
      return updatedLocation
    })
})
