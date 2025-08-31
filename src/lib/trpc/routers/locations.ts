// Locations tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { LocationType } from '@prisma/client'
import { generateUniqueQRCode, logActivity } from '../../db'

// Helper: Validate placement using household-specific hierarchy rules
async function isPlacementAllowed(ctx: any, parentType: string, childType: string): Promise<boolean> {
  // Find user's default household (first membership)
  const membership = await ctx.db.householdMember.findFirst({
    where: { userId: ctx.user.id },
    orderBy: { joinedAt: 'asc' }
  })

  if (!membership) {
    // No household membership; allow by default
    return true
  }

  const householdId = membership.householdId

  // If the household has no rules configured yet, allow all (acts like extended)
  // const anyRules = await ctx.db.hierarchyRule.count({ where: { householdId } }) // Removed - not in schema
  // if (anyRules === 0) {
  //   return true
  // }
  return true // Placeholder since hierarchyRule not in schema

  // Look up specific rule
  // const rule = await ctx.db.hierarchyRule.findFirst({ // Removed - not in schema
  //   where: {
  //     householdId,
  //     parentType: parentType as any,
  //     childType: childType as any
  //   }
  // })

  // return rule?.isAllowed === true
  return true // Placeholder since hierarchyRule not in schema
}

// Helper function to build breadcrumbs for navigation
async function buildBreadcrumbs(ctx: any, locationId: string): Promise<any[]> {
  const breadcrumbs: any[] = []
  let currentId: string | null = locationId

  // Build breadcrumbs by walking up the hierarchy
  while (currentId) {
    const location = await ctx.db.location.findFirst({
      where: {
        id: currentId,
        userId: ctx.user.id
      }
    })

    if (!location) break

    breadcrumbs.unshift({
      id: location.id,
      name: location.name,
      type: location.type
    })

    currentId = location.parentId
  }

  // Add root level
  breadcrumbs.unshift({
    id: null,
    name: 'Alle lokasjoner'
  })

  return breadcrumbs
}

export const locationsRouter = createTRPCRouter({
  // Get all locations for user (hierarchical tree)
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Hent alle lokasjoner for brukeren
        const allLocations = await ctx.db.location.findMany({
          where: { userId: ctx.user.id },
          include: {
            parent: true,
            _count: { select: { items: true } }
          },
          orderBy: { name: 'asc' }
        })
        
        // Funksjjon for å bygge hierarkisk struktur
        const buildHierarchy = (locations: typeof allLocations, parentId: string | null = null): any[] => {
          return locations
            .filter(loc => loc.parentId === parentId)
            .map(loc => ({
              id: loc.id,
              name: loc.name,
              type: loc.type,
              parentId: loc.parentId,
              userId: loc.userId,
              qrCode: loc.qrCode,
              description: loc.description,
              // Skip Date objects since superjson is disabled
              itemCount: loc._count?.items || 0,
              children: buildHierarchy(locations, loc.id)
            }))
        }
        
        // Returner kun root-lokasjoner med hierarkisk struktur
        return buildHierarchy(allLocations, null)
      } catch (error) {
        console.error('Error in locations.getAll:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente lokasjoner'
        })
      }
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
      try {
        // Clean parentId - convert empty string to null
        let parentId = input.parentId
        if (!parentId || parentId === '' || (typeof parentId === 'string' && parentId.trim() === '')) {
          parentId = null
        }
        
        // Verify parent location if specified
        if (parentId) {
          const parent = await ctx.db.location.findFirst({
            where: {
              id: parentId,
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
        
        // Create location in database
        const location = await ctx.db.location.create({
          data: {
            name: input.name,
            description: input.description,
            type: input.type as any,
            parentId: parentId,
            qrCode,
            userId: ctx.user.id
          }
        })
        
        // Return simple response (no Date objects since superjson is disabled)
        return {
          success: true,
          id: location.id,
          name: location.name,
          type: location.type,
          qrCode: location.qrCode,
          description: location.description,
          parentId: location.parentId
        }
      } catch (error) {
        console.error('Error in locations.create:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette lokasjon'
        })
      }
    }),

  // Bulk create locations
  bulkCreate: protectedProcedure
    .input(z.object({
      locations: z.array(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(['ROOM', 'SHELF', 'BOX', 'CONTAINER', 'DRAWER', 'CABINET', 'SHELF_COMPARTMENT', 'BAG', 'SECTION']),
        parentId: z.string().nullable().optional()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const results = []
        
        for (const locationData of input.locations) {
          // Clean parentId - convert empty string to null
          let parentId = locationData.parentId
          if (!parentId || parentId === '' || (typeof parentId === 'string' && parentId.trim() === '')) {
            parentId = null
          }
          
          // Verify parent location if specified
          if (parentId) {
            const parent = await ctx.db.location.findFirst({
              where: {
                id: parentId,
                userId: ctx.user.id
              }
            })
            
            if (!parent) {
              throw new TRPCError({
                code: 'NOT_FOUND',
                message: `Overordnet lokasjon ikke funnet for ${locationData.name}`
              })
            }
          }
          
          // Generate unique QR code
          const qrCode = await generateUniqueQRCode()
          
          // Create location in database
          const location = await ctx.db.location.create({
            data: {
              name: locationData.name,
              description: locationData.description,
              type: locationData.type as any,
              parentId: parentId,
              qrCode,
              userId: ctx.user.id
            }
          })
          
          results.push({
            success: true,
            id: location.id,
            name: location.name,
            type: location.type,
            qrCode: location.qrCode,
            description: location.description,
            parentId: location.parentId
          })
        }
        
        return {
          success: true,
          count: results.length,
          locations: results
        }
      } catch (error) {
        console.error('Error in locations.bulkCreate:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette lokasjoner'
        })
      }
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
        if (!(await isPlacementAllowed(ctx, parent.type, newType))) {
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
      
      // Return serialized location object
      return {
        id: location.id,
        name: location.name,
        type: location.type,
        parentId: location.parentId,
        userId: location.userId,
        qrCode: location.qrCode,
        description: location.description,
        createdAt: location.createdAt.toISOString(),
        updatedAt: location.updatedAt.toISOString(),
        parent: location.parent ? {
          id: location.parent.id,
          name: location.parent.name,
          type: location.parent.type
        } : null,
        children: location.children ? location.children.map(child => ({
          id: child.id,
          name: child.name,
          type: child.type
        })) : []
      }
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
        type: 'LOCATION_UPDATED' as any,
        description: `Genererte ny QR-kode for ${location.name}`,
        userId: ctx.user.id,
        locationId: location.id,
        metadata: {
          oldQRCode: location.qrCode,
          newQRCode: newQRCode
        }
      })
      
      return updatedLocation
    }),

  // Wizard-specific mutations
  createWithWizard: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      displayName: z.string().optional(),
      description: z.string().optional(),
      type: z.nativeEnum(LocationType),
      parentId: z.string().optional(),
      autoNumber: z.string().optional(),
      level: z.number(),
      isPrivate: z.boolean().default(false),
      colorCode: z.string().optional(),
      tags: z.array(z.string()).default([]),
      wizardOrder: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate unique QR code
      const qrCode = await generateUniqueQRCode()
      
      // Verify parent exists if specified
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
            message: 'Parent lokasjon ikke funnet'
          })
        }
      }

      const location = await ctx.db.location.create({
        data: {
          name: input.name,
          // displayName: input.displayName, // Removed - not in schema
          description: input.description,
          type: input.type,
          qrCode,
          parentId: input.parentId,
          // autoNumber: input.autoNumber, // Removed - not in schema
          // level: input.level, // Removed - not in schema
          // isWizardCreated: true, // Removed - not in schema
          // wizardOrder: input.wizardOrder, // Removed - not in schema
          // isPrivate: input.isPrivate, // Removed - not in schema
          // colorCode: input.colorCode, // Removed - not in schema
          // tags: input.tags.length > 0 ? JSON.stringify(input.tags) : null, // Removed - not in schema
          // allowedUsers: null, // Removed - not in schema
          // images: null, // Removed - not in schema
          // primaryImage: null, // Removed - not in schema
          // householdId: null, // Removed - not in schema // TODO: Set based on user's household
          // isActive: true, // Removed - not in schema
          userId: ctx.user.id
        },
        include: {
          parent: true,
          _count: { select: { items: true } }
        }
      })

      // Log wizard activity
      await logActivity({
        type: 'WIZARD_LOCATION_CREATED' as any,
        description: `Opprettet ${input.type.toLowerCase()} "${input.name}" via wizard`,
        userId: ctx.user.id,
        locationId: location.id,
        metadata: {
          // autoNumber: input.autoNumber, // Removed - not in schema
          // level: input.level, // Removed - not in schema
          parentId: input.parentId
        }
      })

      // Return serialized location object
      return {
        id: location.id,
        name: location.name,
        type: location.type,
        parentId: location.parentId,
        userId: location.userId,
        qrCode: location.qrCode,
        description: location.description,
        createdAt: location.createdAt.toISOString(),
        updatedAt: location.updatedAt.toISOString(),
        _count: location._count,
        parent: location.parent ? {
          id: location.parent.id,
          name: location.parent.name,
          type: location.parent.type
        } : null
      }
    }),

  // Get content for a specific location (children + items)
  getLocationContent: protectedProcedure
    .input(z.object({
      locationId: z.string().nullable()
    }))
    .query(async ({ ctx, input }) => {
      try {
        let currentLocation = null
        let breadcrumbs: any[] = []

        // Get current location if specified
        if (input.locationId) {
          currentLocation = await ctx.db.location.findFirst({
            where: {
              id: input.locationId,
              userId: ctx.user.id
            }
          })

          if (!currentLocation) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Lokasjon ikke funnet'
            })
          }

          // Build breadcrumbs
          breadcrumbs = await buildBreadcrumbs(ctx, input.locationId)
        } else {
          // Root level
          breadcrumbs = [{ id: null, name: 'Alle lokasjoner' }]
        }

        // Get child locations
        const childLocations = await ctx.db.location.findMany({
          where: {
            parentId: input.locationId,
            userId: ctx.user.id
          },
          include: {
            _count: { select: { items: true } }
          },
          orderBy: { name: 'asc' }
        })

        // Get items in this location
        const items = await ctx.db.item.findMany({
          where: {
            locationId: input.locationId || undefined,
            userId: ctx.user.id
          },
          include: {
            category: true
          },
          orderBy: { name: 'asc' }
        })

        return {
          currentLocation: currentLocation ? {
            id: currentLocation.id,
            name: currentLocation.name,
            type: currentLocation.type,
            description: currentLocation.description,
            qrCode: currentLocation.qrCode,
            parentId: currentLocation.parentId
          } : null,
          childLocations: childLocations.map(loc => ({
            id: loc.id,
            name: loc.name,
            type: loc.type,
            description: loc.description,
            qrCode: loc.qrCode,
            itemCount: loc._count.items
          })),
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category ? {
              id: item.category.id,
              name: item.category.name
            } : null
          })),
          breadcrumbs
        }
      } catch (error) {
        console.error('Error in locations.getLocationContent:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente lokasjon-innhold'
        })
      }
    }),

  generateAutoName: protectedProcedure
    .input(z.object({
      type: z.nativeEnum(LocationType),
      parentId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const { AutoNamingService } = await import('@/lib/services/auto-naming-service')
      
      const result = await AutoNamingService.generateName({
        type: input.type,
        parentId: input.parentId,
        userId: ctx.user.id
      })
      
      return result
    }),

  getAllowedChildTypes: protectedProcedure
    .input(z.object({
      parentType: z.nativeEnum(LocationType).optional()
    }))
    .query(async ({ ctx, input }) => {
      const { AutoNamingService } = await import('@/lib/services/auto-naming-service')
      
      return AutoNamingService.getAllowedChildTypes(input.parentType)
    }),

  getLocationPath: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { AutoNamingService } = await import('@/lib/services/auto-naming-service')
      
      return await AutoNamingService.getLocationPath(input)
    })
})
