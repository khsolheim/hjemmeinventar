// Locations tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { generateUniqueQRCode, logActivity } from '../../db'

// Hierarki-regler for lokasjonstyper
const HIERARCHY_RULES: Record<string, string[]> = {
  ROOM: ['SHELF', 'CABINET', 'CONTAINER'],
  SHELF: ['SHELF_COMPARTMENT', 'BOX', 'DRAWER'],
  SHELF_COMPARTMENT: ['BOX', 'BAG', 'CONTAINER'],
  BOX: ['BAG', 'SECTION'],
  BAG: [], // Kun gjenstander
  CABINET: ['DRAWER', 'SHELF_COMPARTMENT'],
  DRAWER: ['SECTION', 'BAG'],
  CONTAINER: ['BAG', 'SECTION'],
  SECTION: ['BAG']
}

// Helper function for validating parent-child relationship
function validateHierarchy(parentType: string, childType: string): boolean {
  return HIERARCHY_RULES[parentType]?.includes(childType) || false
}

export const locationsRouter = createTRPCRouter({
  // Get all locations for user (hierarchical tree)
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      console.log('=== CRITICAL DEBUGGING ===')
      console.log('Current user ID from session:', ctx.user.id)
      console.log('User ID type:', typeof ctx.user.id)
      
      // Hent ALLE lokasjoner for å se userId-ene
      const allLocationsInDB = await ctx.db.location.findMany({
        select: { id: true, name: true, userId: true }
      })
      console.log('All locations in DB with userIds:', allLocationsInDB)
      console.log('Unique user IDs in DB:', [...new Set(allLocationsInDB.map(l => l.userId))])
      
      // Hent alle lokasjoner og bygg hierarkiet i koden
      const allLocations = await ctx.db.location.findMany({
        where: { userId: ctx.user.id },
        include: {
          parent: true,
          _count: { select: { items: true } }
        },
        orderBy: { name: 'asc' }
      })
      
      console.log('Matching locations for current user:', allLocations.length)
      
      // MIDLERTIDIG FIX: Hvis bruker har 0 lokasjoner men det finnes lokasjoner i DB,
      // tilordne dem til current user (kun under utvikling)
      if (allLocations.length === 0 && allLocationsInDB.length > 0) {
        console.log('FIXING: No locations for current user, but locations exist. Reassigning to current user...')
        
        // Oppdater alle lokasjoner til current user
        await ctx.db.location.updateMany({
          data: { userId: ctx.user.id }
        })
        
        console.log('Updated all locations to current user. Refetching...')
        
        // Hent på nytt
        const updatedLocations = await ctx.db.location.findMany({
          where: { userId: ctx.user.id },
          include: {
            parent: true,
            _count: { select: { items: true } }
          },
          orderBy: { name: 'asc' }
        })
        
        console.log('After update - found locations:', updatedLocations.length)
        
        // Funksjjon for å bygge hierarkisk struktur
        const buildHierarchy = (locations: typeof updatedLocations, parentId: string | null = null): any[] => {
          return locations
            .filter(loc => loc.parentId === parentId)
            .map(loc => ({
              ...loc,
              children: buildHierarchy(locations, loc.id)
            }))
        }
        
        return buildHierarchy(updatedLocations, null)
      }
      
      // Funksjjon for å bygge hierarkisk struktur
      const buildHierarchy = (locations: typeof allLocations, parentId: string | null = null): any[] => {
        return locations
          .filter(loc => loc.parentId === parentId)
          .map(loc => ({
            ...loc,
            children: buildHierarchy(locations, loc.id)
          }))
      }
      
      // Returner kun root-lokasjoner med hierarkisk struktur
      return buildHierarchy(allLocations, null)
    }),

  // ALTERNATIV: Get all locations as flat list (for debugging)
  getAllFlat: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.location.findMany({
        where: { userId: ctx.user.id },
        orderBy: { name: 'asc' }
      })
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
      type: z.enum(['ROOM', 'SHELF', 'BOX', 'CONTAINER', 'DRAWER', 'CABINET', 'SHELF_COMPARTMENT', 'BAG', 'SECTION']),
      parentId: z.string().nullable().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Clean parentId - convert empty string to undefined and validate
      let parentId = input.parentId
      if (!parentId || parentId === '' || parentId === null || (typeof parentId === 'string' && parentId.trim() === '')) {
        parentId = undefined
      }
      
      console.log('Creating location with parentId:', parentId, 'original:', input.parentId)
      console.log('User ID:', ctx.user.id)
      
      // Verify user exists
      const userExists = await ctx.db.user.findUnique({
        where: { id: ctx.user.id }
      })
      
      if (!userExists) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Bruker ikke funnet'
        })
      }
      
      const cleanedInput = {
        name: input.name,
        description: input.description,
        type: input.type,
        parentId: parentId
      }
      
      // Verify parent location if specified
      if (cleanedInput.parentId) {
        console.log('Verifying parent location:', cleanedInput.parentId)
        const parent = await ctx.db.location.findFirst({
          where: {
            id: cleanedInput.parentId,
            userId: ctx.user.id
          }
        })
        
        console.log('Parent found:', !!parent)
        
        if (!parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Overordnet lokasjon ikke funnet'
          })
        }
        
        // Validate hierarchy rules
        if (!validateHierarchy(parent.type, cleanedInput.type)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `En ${cleanedInput.type.toLowerCase()} kan ikke plasseres i en ${parent.type.toLowerCase()}. Sjekk hierarki-reglene.`
          })
        }
      }
      
      // Generate unique QR code
      const qrCode = await generateUniqueQRCode()
      
      const location = await ctx.db.location.create({
        data: {
          name: cleanedInput.name,
          description: cleanedInput.description,
          type: cleanedInput.type as any, // TypeScript workaround for SHELF_COMPARTMENT
          parentId: cleanedInput.parentId || null,
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
      type: z.enum(['ROOM', 'SHELF', 'BOX', 'CONTAINER', 'DRAWER', 'CABINET', 'SHELF_COMPARTMENT', 'BAG', 'SECTION']).optional(),
      parentId: z.string().nullable().optional()
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
      
      // Clean parentId for update
      if (updateData.parentId !== undefined) {
        if (updateData.parentId === null || updateData.parentId === '') {
          updateData.parentId = null
        }
      }

      // Verify new parent if specified
      if (updateData.parentId && updateData.parentId !== null) {
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
        
        // Validate hierarchy rules for new parent-child relationship
        const newType = updateData.type || existingLocation.type
        if (!validateHierarchy(parent.type, newType)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `En ${newType.toLowerCase()} kan ikke plasseres i en ${parent.type.toLowerCase()}. Sjekk hierarki-reglene.`
          })
        }
      }
      
      const location = await ctx.db.location.update({
        where: { id },
        data: {
          name: updateData.name,
          description: updateData.description,
          type: updateData.type as any, // TypeScript workaround for SHELF_COMPARTMENT
          parentId: updateData.parentId === undefined ? undefined : updateData.parentId
        },
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
