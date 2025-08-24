// Yarn-specific tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { serializeItemsForClient, serializeItemForClient } from '../../utils/decimal-serializer'

// Helper function to safely parse color code from categoryData
function safeParseColorCode(categoryData: any): string | null {
  if (!categoryData) return null
  return categoryData.colorCode || null
}
import {
  isYarnMaster,
  isYarnBatch,
  isYarnRemnant,
  getBatchesForMaster,
  getMasterForBatch,
  calculateMasterTotals,
  createBatchForMaster,
  createYarnMaster,
  syncMasterDataToBatches,
  createRemnantFromBatch,
  getRemnants,
  useRemnantInProject,
  getRemnantStats,
  type YarnMasterData,
  type YarnBatchData,
  type YarnRemnantData
} from '../../utils/yarn-helpers'
import { YarnService } from '@/lib/services/yarn-service'
import { meilisearchService } from '@/lib/search/meilisearch-service'

export const yarnRouter = createTRPCRouter({
  // Get all yarn patterns for user
  getPatterns: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
      search: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.user.id
      }
      
      if (input.difficulty) {
        where.difficulty = input.difficulty
      }
      
      if (input.search) {
        where.OR = [
          { name: { contains: input.search } },
          { description: { contains: input.search } }
        ]
      }
      
      const [patterns, total] = await Promise.all([
        ctx.db.yarnPattern.findMany({
          where,
          include: {
            projects: {
              select: {
                id: true,
                name: true,
                status: true
              }
            },
            _count: {
              select: { projects: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.yarnPattern.count({ where })
      ])
      
      return { patterns, total }
    }),

  // Get pattern by ID
  getPatternById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const pattern = await ctx.db.yarnPattern.findFirst({
        where: {
          id: input,
          userId: ctx.user.id
        },
        include: {
          projects: {
            include: {
              yarnUsage: {
                include: {
                  item: {
                    include: {
                      category: true,
                      location: true
                    }
                  }
                }
              }
            }
          }
        }
      })
      
      if (!pattern) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Oppskrift ikke funnet'
        })
      }
      
      return pattern
    }),

  // Create new pattern - TEMPORARILY DISABLED
  createPattern: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      patternFileUrl: z.string().optional(),
      imageUrls: z.array(z.string()).default([]),
      difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
      estimatedTime: z.string().optional(),
      needleSize: z.string().optional(),
      gauge: z.string().optional(),
      yarnWeight: z.string().optional(),
      yarnAmount: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Pattern creation temporarily disabled'
      })
    }),

  // Update pattern - TEMPORARILY DISABLED
  updatePattern: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      patternFileUrl: z.string().optional(),
      imageUrls: z.array(z.string()).optional(),
      difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
      estimatedTime: z.string().optional(),
      needleSize: z.string().optional(),
      gauge: z.string().optional(),
      yarnWeight: z.string().optional(),
      yarnAmount: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Pattern update temporarily disabled'
      })
    }),

  // Delete pattern - TEMPORARILY DISABLED
  deletePattern: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Pattern deletion temporarily disabled'
      })
    }),

  // Get all yarn projects for user
  getProjects: protectedProcedure
    .input(z.object({
      status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.user.id
      }
      
      if (input.status) {
        where.status = input.status
      }
      
      const [projects, total] = await Promise.all([
        ctx.db.yarnProject.findMany({
          where,
          include: {
            pattern: {
              select: {
                id: true,
                name: true,
                difficulty: true
              }
            },
            yarnUsage: {
              include: {
                item: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    categoryData: true
                  }
                }
              }
            },
            _count: {
              select: { yarnUsage: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.yarnProject.count({ where })
      ])
      
      return { projects, total }
    }),

  // Get project by ID
  getProjectById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.yarnProject.findFirst({
        where: {
          id: input,
          userId: ctx.user.id
        },
        include: {
          pattern: true,
          yarnUsage: {
            include: {
              item: {
                include: {
                  category: true,
                  location: true,
                  distributions: {
                    include: {
                      location: true
                    }
                  }
                }
              }
            }
          }
        }
      })
      
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prosjekt ikke funnet'
        })
      }
      
      return project
    }),

  // Create new project
  createProject: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      patternId: z.string().optional(),
      status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).default('PLANNED'),
      startDate: z.date().optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify pattern belongs to user if specified
      if (input.patternId) {
        const pattern = await ctx.db.yarnPattern.findFirst({
          where: {
            id: input.patternId,
            userId: ctx.user.id
          }
        })
        
        if (!pattern) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Oppskrift ikke funnet'
          })
        }
      }
      
      const project = await ctx.db.yarnProject.create({
        data: {
          ...input,
          userId: ctx.user.id
        },
        include: {
          pattern: true
        }
      })
      
      return project
    }),

  // Update project
  updateProject: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
      progressImages: z.array(z.string()).optional(),
      finalImages: z.array(z.string()).optional(),
      notes: z.string().optional(),
      startDate: z.date().optional(),
      completedDate: z.date().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      
      const project = await ctx.db.yarnProject.findFirst({
        where: {
          id,
          userId: ctx.user.id
        }
      })
      
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prosjekt ikke funnet'
        })
      }
      
      // Process image arrays
      const { progressImages, finalImages, ...otherData } = updateData
      const processedUpdateData = {
        ...otherData,
        ...(progressImages && { progressImages }),
        ...(finalImages && { finalImages })
      }

      // Auto-set completion date if status changes to COMPLETED
      if (processedUpdateData.status === 'COMPLETED' && project.status !== 'COMPLETED') {
        processedUpdateData.completedDate = new Date()
      }
      
      const updatedProject = await ctx.db.yarnProject.update({
        where: { id },
        data: processedUpdateData,
        include: {
          pattern: true,
          yarnUsage: {
            include: {
              item: true
            }
          }
        }
      })
      
      return updatedProject
    }),

  // Add yarn to project
  addYarnToProject: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      itemId: z.string(),
      quantityUsed: z.number().min(0),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify project belongs to user
      const project = await ctx.db.yarnProject.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.user.id
        }
      })
      
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prosjekt ikke funnet'
        })
      }
      
      // Verify item belongs to user and is yarn category
      const item = await ctx.db.item.findFirst({
        where: {
          id: input.itemId,
          userId: ctx.user.id
        },
        include: {
          category: true
        }
      })
      
      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Gjenstand ikke funnet'
        })
      }
      
      // Check if yarn is already added to project
      const existingUsage = await ctx.db.projectYarnUsage.findFirst({
        where: {
          projectId: input.projectId,
          itemId: input.itemId
        }
      })
      
      if (existingUsage) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Dette garnet er allerede lagt til prosjektet'
        })
      }
      
      const yarnUsage = await ctx.db.projectYarnUsage.create({
        data: {
          projectId: input.projectId,
          itemId: input.itemId,
          quantityUsed: input.quantityUsed,
          notes: input.notes
        },
        include: {
          item: true,
          project: true
        }
      })
      
      return yarnUsage
    }),

  // Update yarn usage in project
  updateYarnUsage: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      itemId: z.string(),
      quantityUsed: z.number().min(0),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const usage = await ctx.db.projectYarnUsage.findFirst({
        where: {
          projectId: input.projectId,
          itemId: input.itemId
        },
        include: {
          project: true
        }
      })
      
      if (!usage || usage.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Garn-bruk ikke funnet i prosjekt'
        })
      }
      
      const updatedUsage = await ctx.db.projectYarnUsage.update({
        where: {
          projectId_itemId: {
            projectId: input.projectId,
            itemId: input.itemId
          }
        },
        data: {
          quantityUsed: input.quantityUsed,
          notes: input.notes
        },
        include: {
          item: true
        }
      })
      
      return updatedUsage
    }),

  // Remove yarn from project
  removeYarnFromProject: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      itemId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const usage = await ctx.db.projectYarnUsage.findFirst({
        where: {
          projectId: input.projectId,
          itemId: input.itemId
        },
        include: {
          project: true
        }
      })
      
      if (!usage || usage.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Garn-bruk ikke funnet i prosjekt'
        })
      }
      
      await ctx.db.projectYarnUsage.delete({
        where: {
          projectId_itemId: {
            projectId: input.projectId,
            itemId: input.itemId
          }
        }
      })
      
      return { success: true }
    }),

  // Get yarn statistics
  getYarnStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Get yarn category ID
      const yarnCategory = await ctx.db.category.findFirst({
        where: {
          name: { contains: 'garn' }
        }
      })
      
      if (!yarnCategory) {
        return {
          totalYarns: 0,
          totalPatterns: 0,
          totalProjects: 0,
          activeProjects: 0
        }
      }
      
      const [
        totalYarns,
        totalPatterns,
        totalProjects,
        activeProjects
      ] = await Promise.all([
        ctx.db.item.count({
          where: {
            userId: ctx.user.id,
            categoryId: yarnCategory.id
          }
        }),
        ctx.db.yarnPattern.count({
          where: { userId: ctx.user.id }
        }),
        ctx.db.yarnProject.count({
          where: { userId: ctx.user.id }
        }),
        ctx.db.yarnProject.count({
          where: {
            userId: ctx.user.id,
            status: 'IN_PROGRESS'
          }
        })
      ])
      
      return {
        totalYarns,
        totalPatterns,
        totalProjects,
        activeProjects
      }
    }),

  // YARN MASTER/BATCH SYSTEM ENDPOINTS

  // Opprett ny garn master
  createMaster: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      locationId: z.string().optional(),
      producer: z.string().optional(),
      composition: z.string().optional(),
      yardage: z.string().optional(),
      weight: z.string().optional(),
      gauge: z.string().optional(),
      needleSize: z.string().optional(),
      careInstructions: z.string().optional(),
      store: z.string().optional(),
      notes: z.string().optional(),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const service = new YarnService(ctx.db, ctx.user.id)
      const master = await service.createMaster({
        name: input.name,
        locationId: input.locationId,
        imageUrl: input.imageUrl,
        categoryData: {
          producer: input.producer,
          composition: input.composition,
          yardage: input.yardage,
          weight: input.weight,
          gauge: input.gauge,
          needleSize: input.needleSize,
          careInstructions: input.careInstructions,
          store: input.store,
          notes: input.notes,
        }
      })
      return master
    }),

  // Opprett ny batch for eksisterende master
  createBatch: protectedProcedure
    .input(z.object({
      masterId: z.string(),
      name: z.string().min(1),
      locationId: z.string(),
      batchNumber: z.string().min(1),
      color: z.string().min(1),
      colorCode: z.string().optional(),
      quantity: z.number().min(1),
      pricePerSkein: z.number().min(0).optional(),
      purchaseDate: z.date().optional(),
      condition: z.string().optional(),
      notes: z.string().optional(),
      imageUrl: z.string().optional(),
      unit: z.string().default('nøste'),
      colorId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const master = await ctx.db.item.findFirst({
        where: { id: input.masterId, userId: ctx.user.id },
        include: { category: true }
      })
      if (!master || !isYarnMaster(master.category?.name)) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Garn Master ikke funnet' })
      }

      const service = new YarnService(ctx.db, ctx.user.id)
      const batch = await service.createBatch({
        masterId: input.masterId,
        name: input.name,
        locationId: input.locationId,
        imageUrl: input.imageUrl,
        unit: input.unit,
        categoryData: {
          batchNumber: input.batchNumber,
          color: input.color,
          colorCode: input.colorCode,
          quantity: input.quantity,
          pricePerSkein: input.pricePerSkein,
          purchaseDate: input.purchaseDate,
          condition: input.condition,
          notes: input.notes,
          masterItemId: input.masterId,
        },
        colorId: input.colorId,
      })

      return batch
    }),

  // Oppdater eksisterende batch
  updateBatch: protectedProcedure
    .input(z.object({
      batchId: z.string(),
      name: z.string().optional(),
      locationId: z.string().optional(),
      batchNumber: z.string().optional(),
      color: z.string().optional(),
      colorCode: z.string().optional(),
      quantity: z.number().min(0).optional(),
      pricePerSkein: z.number().min(0).optional(),
      purchaseDate: z.date().optional(),
      condition: z.string().optional(),
      notes: z.string().optional(),
      imageUrl: z.string().optional(),
      unit: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const batch = await ctx.db.item.findFirst({
        where: { id: input.batchId, userId: ctx.user.id },
        include: { category: true }
      })
      if (!batch || !isYarnBatch(batch.category?.name)) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Batch ikke funnet' })
      }

      const currentData = batch.categoryData || {}
      const updatedData = {
        ...(currentData as any),
        ...(input.batchNumber !== undefined ? { batchNumber: input.batchNumber } : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
        ...(input.colorCode !== undefined ? { colorCode: input.colorCode } : {}),
        ...(input.pricePerSkein !== undefined ? { pricePerSkein: input.pricePerSkein } : {}),
        ...(input.condition !== undefined ? { condition: input.condition } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      }

      // Håndter mengde justering
      let newTotal = batch.totalQuantity
      let newAvailable = Number(batch.availableQuantity)
      if (input.quantity !== undefined) {
        const diff = Math.round(input.quantity) - Number(batch.totalQuantity)
        newTotal = Math.round(input.quantity)
        newAvailable = Math.max(0, newAvailable + diff)
      }

      const updated = await ctx.db.item.update({
        where: { id: input.batchId },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.locationId !== undefined ? { locationId: input.locationId } : {}),
          ...(input.purchaseDate !== undefined ? { purchaseDate: input.purchaseDate } : {}),
          ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
          ...(input.unit !== undefined ? { unit: input.unit } : {}),
          ...(input.quantity !== undefined ? { totalQuantity: newTotal, availableQuantity: newAvailable } : {}),
          ...(input.pricePerSkein !== undefined ? { price: input.pricePerSkein } : {}),
          categoryData: JSON.stringify(updatedData)
        }
      })

      return updated
    }),

  // Hent alle batches for en master
  getBatchesForMaster: protectedProcedure
    .input(z.object({
      masterId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const batches = await getBatchesForMaster(ctx.db, input.masterId, ctx.user.id)
      return batches
    }),

  // Hent master for en batch
  getMasterForBatch: protectedProcedure
    .input(z.object({
      batchId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const master = await getMasterForBatch(ctx.db, input.batchId, ctx.user.id)
      return master
    }),

  // Hent master og farge for en batch
  getBatchDetails: protectedProcedure
    .input(z.object({
      batchId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx
      const { batchId } = input

      // Hent master via typed relasjon
      const masterRelation = await db.itemRelation.findFirst({
        where: { 
          userId: user.id, 
          relationType: 'MASTER_OF', 
          toItemId: batchId 
        },
        select: { fromItemId: true }
      })

      let master = null
      if (masterRelation) {
        master = await db.item.findFirst({ 
          where: { id: masterRelation.fromItemId, userId: user.id } 
        })
      }

      // Hent farge via typed relasjon BATCH_OF (color -> batch)
      const colorRelation = await db.itemRelation.findFirst({
        where: { 
          userId: user.id, 
          relationType: 'BATCH_OF', 
          toItemId: batchId 
        },
        select: { fromItemId: true }
      })

      let color = null
      if (colorRelation) {
        color = await db.item.findFirst({ 
          where: { id: colorRelation.fromItemId, userId: user.id },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            categoryData: true
          }
        })
      }

      // Fallback: søk via legacy relatedItems hvis ingen typed relasjoner - DISABLED
      // if (!color && !master) {
      //   const batch = await db.item.findFirst({
      //     where: { id: batchId, userId: user.id },
      //     include: { 
      //       relatedItems: { 
      //         include: { category: true },
      //         where: { userId: user.id }
      //       } 
      //     }
      //   })

      //   if (batch?.relatedItems) {
      //     for (const item of batch.relatedItems) {
      //       if (item.category?.name === 'Garn Master' && !master) {
      //         master = item
      //       }
      //       if (item.category?.name === 'Garn Farge' && !color) {
      //         color = {
      //           id: item.id,
      //           name: item.name,
      //           imageUrl: item.imageUrl,
      //           categoryData: item.categoryData
      //         }
      //       }
      //     }
      //   }
      // }

      return {
        master,
        color: color ? {
          ...color,
          colorCode: safeParseColorCode(color.categoryData)
        } : null
      }
    }),

  // Hent aggregerte data for en master
  getMasterTotals: protectedProcedure
    .input(z.object({
      masterId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const totals = await calculateMasterTotals(ctx.db, input.masterId, ctx.user.id)
      return totals
    }),

  // YARN COLOR LEVEL ENDPOINTS

  // Opprett ny farge knyttet til en master
  createColor: protectedProcedure
    .input(z.object({
      masterId: z.string(),
      name: z.string().min(1),
      colorCode: z.string().optional(),
      imageUrl: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Forsøk å finne eksisterende farge for denne masteren basert på navn (case-insensitivt) og colorCode
      const colorCategoryExisting = await ctx.db.category.findFirst({ where: { name: 'Garn Farge' } })
      if (colorCategoryExisting) {
        const existingColors = await ctx.db.item.findMany({
          where: {
            userId: ctx.user.id,
            categoryId: colorCategoryExisting.id,
            // OR: [
            //   { relatedItems: { some: { id: input.masterId } } },
            //   { relatedTo: { some: { id: input.masterId } } }
            // ]
          }
        })
        const normalizedName = input.name.trim().toLowerCase()
        const match = existingColors.find(c => {
          const sameName = c.name.trim().toLowerCase() === normalizedName
          const code = safeParseColorCode(c.categoryData)
          const sameCode = (code || '').toLowerCase() === (input.colorCode || '').trim().toLowerCase()
          return sameName && (!input.colorCode || sameCode)
        })
        if (match) return match
      }

      const service = new YarnService(ctx.db, ctx.user.id)
      const color = await service.createColor({
        masterId: input.masterId,
        name: input.name,
        colorCode: input.colorCode,
        imageUrl: input.imageUrl
      })

      return color
    }),

  // Hent alle farger for en master med summer
  getColorsForMaster: protectedProcedure
    .input(z.any().optional())
    .query(async ({ ctx, input }) => {
      try {
        const masterId = typeof input === 'object' && input ? (input as any).masterId : undefined
        if (!masterId) {
          return []
        }

        // Typed: finn farger via ItemRelation COLOR_OF (from master -> to color)
        const typedLinks = await ctx.db.itemRelation.findMany({
          where: { userId: ctx.user.id, relationType: 'COLOR_OF', fromItemId: masterId },
          select: { toItemId: true }
        })
        let colorIds = typedLinks.map(l => l.toItemId)

        if (colorIds.length === 0) {
          // Legacy fallback via kategori og relatedItems
          const colorCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Farge' } })
          if (!colorCategory) return []

          const legacyColors = await ctx.db.item.findMany({
            where: {
              userId: ctx.user.id,
              categoryId: colorCategory.id,
              // OR: [
            //   { relatedItems: { some: { id: masterId } } },
            //   { relatedTo: { some: { id: masterId } } }
            // ]
            },
            select: { id: true }
          })
          colorIds = legacyColors.map(c => c.id)
        }

        if (colorIds.length === 0) return []

        const colors = await ctx.db.item.findMany({ where: { id: { in: colorIds } } })

        // Hent batches for hver farge (typed: BATCH_OF fra color -> to batch)
        const batchCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Batch' } })
        const results: Array<{ id: string, name: string, colorCode?: string, imageUrl?: string, batchCount: number, skeinCount: number }> = []

        for (const color of colors) {
          // Typed batches knyttet til fargen
          const typedBatchLinks = await ctx.db.itemRelation.findMany({
            where: { userId: ctx.user.id, relationType: 'BATCH_OF', fromItemId: color.id },
            select: { toItemId: true }
          })
          let batchIds = typedBatchLinks.map(l => l.toItemId)

          if (batchIds.length === 0 && batchCategory) {
            // Fallback: via legacy relatedItems
            const legacyBatches = await ctx.db.item.findMany({
              where: {
                userId: ctx.user.id,
                categoryId: batchCategory.id,
                // OR: [
                //   { relatedItems: { some: { id: color.id } } },
                //   { relatedTo: { some: { id: color.id } } }
                // ]
              },
              select: { id: true, availableQuantity: true, categoryData: true }
            })
            batchIds = legacyBatches.map(b => b.id)
          }

          let skeins = 0
          if (batchIds.length > 0) {
            const batches = await ctx.db.item.findMany({ where: { id: { in: batchIds } }, select: { availableQuantity: true, categoryData: true } })
            skeins = batches.reduce((sum, b) => sum + (Number(b.availableQuantity) || 0), 0)
          }

          results.push({
            id: color.id,
            name: color.name,
            colorCode: safeParseColorCode(color.categoryData) || undefined,
            imageUrl: color.imageUrl || undefined,
            batchCount: batchIds.length,
            skeinCount: Math.round(skeins)
          })
        }

        // Sort colors by color code (numerically if possible, then alphabetically)
        results.sort((a, b) => {
          const aCode = a.colorCode || ''
          const bCode = b.colorCode || ''
          
          // Try to parse as numbers first
          const aNum = parseInt(aCode.replace(/[^\d]/g, ''), 10)
          const bNum = parseInt(bCode.replace(/[^\d]/g, ''), 10)
          
          // If both have numeric parts, sort numerically
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum
          }
          
          // If only one has numeric part, prioritize it
          if (!isNaN(aNum) && isNaN(bNum)) return -1
          if (isNaN(aNum) && !isNaN(bNum)) return 1
          
          // Otherwise, sort alphabetically by color code
          return aCode.localeCompare(bCode, 'nb', { numeric: true, sensitivity: 'base' })
        })

        return results
      } catch (e) {
        console.error('getColorsForMaster failed', e)
        return []
      }
    }),

  // Hent alle batches for en farge
  getBatchesForColor: protectedProcedure
    .input(z.object({ colorId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Typed: finn batches via BATCH_OF (from color -> to batch)
      const typedLinks = await ctx.db.itemRelation.findMany({
        where: { userId: ctx.user.id, relationType: 'BATCH_OF', fromItemId: input.colorId },
        select: { toItemId: true }
      })
      let batchIds = typedLinks.map(l => l.toItemId)

      if (batchIds.length === 0) {
        const batchCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Batch' } })
        if (!batchCategory) return []
        const legacy = await ctx.db.item.findMany({
          where: {
            userId: ctx.user.id,
            categoryId: batchCategory.id,
            // OR: [
            //   { relatedItems: { some: { id: input.colorId } } },
            //   { relatedTo: { some: { id: input.colorId } } }
            // ]
          },
          select: { id: true }
        })
        batchIds = legacy.map(b => b.id)
      }

      if (batchIds.length === 0) return []
      const batches = await ctx.db.item.findMany({ where: { id: { in: batchIds } }, include: { location: true } })
      return batches
    }),

  // Oppdater farge
  updateColor: protectedProcedure
    .input(z.object({
      colorId: z.string(),
      name: z.string().min(1).optional(),
      colorCode: z.string().optional(),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const color = await ctx.db.item.findFirst({ where: { id: input.colorId, userId: ctx.user.id }, include: { category: true } })
      if (!color || color.category?.name !== 'Garn Farge') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Farge ikke funnet' })
      }
      const current = color.categoryData || {}
      const updated = {
        ...(current as any),
        ...(input.colorCode !== undefined ? { colorCode: input.colorCode } : {}),
      }
      const result = await ctx.db.item.update({
        where: { id: input.colorId },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
          categoryData: JSON.stringify(updated)
        }
      })
      return result
    }),

  // Slett farge (kun hvis ingen batches er knyttet)
  deleteColor: protectedProcedure
    .input(z.object({ colorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const color = await ctx.db.item.findFirst({ where: { id: input.colorId, userId: ctx.user.id }, include: { category: true } })
      if (!color || color.category?.name !== 'Garn Farge') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Farge ikke funnet' })
      }
      const batchCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Batch' } })
      if (batchCategory) {
        const count = await ctx.db.item.count({
          where: {
            userId: ctx.user.id,
            categoryId: batchCategory.id,
            // OR: [
            //   { relatedItems: { some: { id: input.colorId } } },
            //   { relatedTo: { some: { id: input.colorId } } }
            // ]
          }
        })
        if (count > 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Kan ikke slette farge med tilknyttede batches' })
        }
      }
      await ctx.db.item.delete({ where: { id: input.colorId } })
      return { success: true }
    }),

  // Hent alle yarn masters for brukeren (med enkel avansert filtrering)
  getAllMasters: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
      filters: z.object({
        // Master-level
        producer: z.string().optional(),
        composition: z.string().optional(),
        needleSize: z.string().optional(),
        yarnWeight: z.string().optional(),
        store: z.string().optional(),
        // Batch-level
        color: z.string().optional(),
        condition: z.string().optional(),
        batchNumber: z.string().optional(),
        // Ranges & status
        quantityRange: z.tuple([z.number(), z.number()]).optional(),
        priceRange: z.tuple([z.number(), z.number()]).optional(),
        availabilityStatus: z.string().optional(), // all|available|low|empty|full (best effort)
        // Dates
        purchaseDateFrom: z.date().optional(),
        purchaseDateTo: z.date().optional(),
        // Special
        hasProjects: z.boolean().optional(),
        hasNotes: z.boolean().optional(),
        lowStock: z.boolean().optional(),
        recentlyAdded: z.boolean().optional()
      }).optional()
    }))
    .query(async ({ ctx, input }) => {
      const masterCategory = await ctx.db.category.findFirst({
        where: { name: 'Garn Master' }
      })

      if (!masterCategory) {
        return { masters: [], total: 0 }
      }

      // Base master-level where
      const masterWhere: any = {
        userId: ctx.user.id,
        categoryId: masterCategory.id,
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { description: { contains: input.search, mode: 'insensitive' as const } },
            // Enkel JSON-tekst-søk i categoryData
            { categoryData: { contains: input.search, mode: 'insensitive' as const } }
          ]
        })
      }

      const f = input.filters
      if (f) {
        const andClauses: any[] = []

        // Master-level filters via categoryData substring match (begrensning i SQLite JSON)
        if (f.producer && f.producer !== 'all') {
          andClauses.push({ categoryData: { contains: f.producer, mode: 'insensitive' as const } })
        }
        if (f.composition && f.composition !== 'all') {
          andClauses.push({ categoryData: { contains: f.composition, mode: 'insensitive' as const } })
        }
        if (f.needleSize && f.needleSize !== 'all') {
          andClauses.push({ categoryData: { contains: f.needleSize, mode: 'insensitive' as const } })
        }
        if (f.yarnWeight && f.yarnWeight !== 'all') {
          andClauses.push({ categoryData: { contains: f.yarnWeight, mode: 'insensitive' as const } })
        }
        if (f.store && f.store !== 'all') {
          andClauses.push({ categoryData: { contains: f.store, mode: 'insensitive' as const } })
        }
        if (f.hasNotes) {
          andClauses.push({ categoryData: { contains: 'notes', mode: 'insensitive' as const } })
        }
        if (f.recentlyAdded) {
          const days30 = new Date()
          days30.setDate(days30.getDate() - 30)
          andClauses.push({ createdAt: { gte: days30 } })
        }

        // Batch-level filters via typed relations: master (this) -> ItemRelation(MASTER_OF) -> toItem (batch)
        const toItemFilter: any = {}
        const toItemAnd: any[] = []

        if (f.color) {
          toItemAnd.push({ categoryData: { contains: f.color, mode: 'insensitive' as const } })
        }
        if (f.condition && f.condition !== 'all') {
          toItemAnd.push({ categoryData: { contains: f.condition, mode: 'insensitive' as const } })
        }
        if (f.batchNumber) {
          toItemAnd.push({ categoryData: { contains: f.batchNumber, mode: 'insensitive' as const } })
        }
        if (f.priceRange) {
          toItemAnd.push({ price: { gte: f.priceRange[0], lte: f.priceRange[1] } })
        }
        if (f.quantityRange) {
          toItemAnd.push({ totalQuantity: { gte: Math.floor(f.quantityRange[0]), lte: Math.floor(f.quantityRange[1]) } })
        }
        if (f.purchaseDateFrom || f.purchaseDateTo) {
          toItemAnd.push({
            purchaseDate: {
              ...(f.purchaseDateFrom ? { gte: f.purchaseDateFrom } : {}),
              ...(f.purchaseDateTo ? { lte: f.purchaseDateTo } : {})
            }
          })
        }
        if (f.lowStock) {
          // Best effort: minst én batch med lav beholdning (<=2 og >0)
          toItemAnd.push({ availableQuantity: { lte: 2 } })
          toItemAnd.push({ availableQuantity: { gt: 0 } })
        }
        if (f.hasProjects) {
          toItemAnd.push({ projectUsage: { some: {} } })
        }
        if (f.availabilityStatus && f.availabilityStatus !== 'all') {
          if (f.availabilityStatus === 'available') {
            toItemAnd.push({ availableQuantity: { gt: 0 } })
          } else if (f.availabilityStatus === 'low') {
            toItemAnd.push({ availableQuantity: { gt: 0 } })
            toItemAnd.push({ availableQuantity: { lte: 2 } })
          } else if (f.availabilityStatus === 'empty') {
            toItemAnd.push({ availableQuantity: 0 as any })
          } else if (f.availabilityStatus === 'full') {
            // full: availableQuantity == totalQuantity
            toItemAnd.push({ availableQuantity: { equals: { $fields: ['totalQuantity'] } } as any })
          }
        }

        if (toItemAnd.length > 0) {
          toItemFilter.AND = (toItemFilter.AND || []).concat(toItemAnd)
        }

        if (Object.keys(toItemFilter).length > 0) {
          andClauses.push({
            itemRelationsFrom: {
              some: {
                relationType: 'MASTER_OF',
                toItem: toItemFilter
              }
            }
          })
        }

        if (andClauses.length > 0) {
          masterWhere.AND = (masterWhere.AND || []).concat(andClauses)
        }
      }

      const [masters, total] = await Promise.all([
        ctx.db.item.findMany({
          where: masterWhere,
          include: {
            location: true,
            category: true,
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.item.count({ where: masterWhere })
      ])

      // Beregn totals for hver master
      const mastersWithTotals = await Promise.all(
        masters.map(async (master) => {
          const totals = await calculateMasterTotals(ctx.db, master.id, ctx.user.id)
          return {
            ...master,
            relatedTo: [],
            totals
          }
        })
      )

      return { masters: serializeItemsForClient(mastersWithTotals), total }
    }),

  // Inde ksbasert søk etter masters (kombinerer Meilisearch + Prisma)
  searchMasters: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
      filters: z.object({
        // Master-level
        producer: z.string().optional(),
        composition: z.string().optional(),
        needleSize: z.string().optional(),
        yarnWeight: z.string().optional(),
        store: z.string().optional(),
        // Batch-level
        color: z.string().optional(),
        condition: z.string().optional(),
        batchNumber: z.string().optional(),
        // Ranges & status
        quantityRange: z.tuple([z.number(), z.number()]).optional(),
        priceRange: z.tuple([z.number(), z.number()]).optional(),
        availabilityStatus: z.string().optional(),
        // Dates
        purchaseDateFrom: z.date().optional(),
        purchaseDateTo: z.date().optional(),
        // Special
        hasProjects: z.boolean().optional(),
        hasNotes: z.boolean().optional(),
        lowStock: z.boolean().optional(),
        recentlyAdded: z.boolean().optional()
      }).optional()
    }))
    .query(async ({ ctx, input }) => {
      const masterCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Master' } })
      const batchCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Batch' } })
      if (!masterCategory) return { masters: [], total: 0 }

      const f = input.filters

      // 1) Hent kandidat masterIds via Meilisearch når batch-filtre eller søk foreligger
      let candidateMasterIds: string[] | null = null
      if ((f && (f.color || f.batchNumber)) || (input.search && input.search.trim().length > 0)) {
        // Primært: søk i batches for å finne masterId
        if (batchCategory) {
          const msFilters: Record<string, any> = { isYarnBatch: true }
          if (f?.color) msFilters.batchColor = f.color
          if (f?.batchNumber) msFilters.batchNumber = f.batchNumber
          const ms = await meilisearchService.search(input.search?.trim() || '', {
            userId: ctx.user.id,
            type: 'item',
            filters: msFilters,
            limit: 500,
            offset: 0,
          })
          const masterIdSet = new Set<string>()
          for (const hit of ms.hits as any[]) {
            if (hit.masterId) masterIdSet.add(hit.masterId)
          }
          candidateMasterIds = Array.from(masterIdSet)
          // Hvis ingen via batches og kun search er gitt, forsøk masters direkte for produsent/komposisjon/navn
          if (candidateMasterIds.length === 0 && input.search) {
            const msMasters = await meilisearchService.search(input.search.trim(), {
              userId: ctx.user.id,
              type: 'item',
              filters: { isYarnMaster: true },
              limit: 500,
              offset: 0,
            })
            const ids = new Set<string>()
            for (const hit of msMasters.hits as any[]) {
              // master-dokumenter har ikke masterId; id er item_*
              const rawId = String(hit.id || '')
              if (rawId.startsWith('item_')) ids.add(rawId.replace('item_', ''))
            }
            candidateMasterIds = Array.from(ids)
          }
        }
      }

      // 2) Bygg Prisma where med master- og batch-nivåfiltre
      const masterWhere: any = {
        userId: ctx.user.id,
        categoryId: masterCategory.id,
        ...(candidateMasterIds ? { id: { in: candidateMasterIds.length ? candidateMasterIds : ['__none__'] } } : {}),
        ...(input.search && !candidateMasterIds ? {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { description: { contains: input.search, mode: 'insensitive' as const } },
            { categoryData: { contains: input.search, mode: 'insensitive' as const } }
          ]
        } : {})
      }

      if (f) {
        const andClauses: any[] = []
        if (f.producer && f.producer !== 'all') andClauses.push({ categoryData: { contains: f.producer, mode: 'insensitive' as const } })
        if (f.composition && f.composition !== 'all') andClauses.push({ categoryData: { contains: f.composition, mode: 'insensitive' as const } })
        if (f.needleSize && f.needleSize !== 'all') andClauses.push({ categoryData: { contains: f.needleSize, mode: 'insensitive' as const } })
        if (f.yarnWeight && f.yarnWeight !== 'all') andClauses.push({ categoryData: { contains: f.yarnWeight, mode: 'insensitive' as const } })
        if (f.store && f.store !== 'all') andClauses.push({ categoryData: { contains: f.store, mode: 'insensitive' as const } })
        if (f.hasNotes) andClauses.push({ categoryData: { contains: 'notes', mode: 'insensitive' as const } })
        if (f.recentlyAdded) {
          const days30 = new Date(); days30.setDate(days30.getDate() - 30)
          andClauses.push({ createdAt: { gte: days30 } })
        }
        // Batch-nivå via typed relasjoner
        const toItemAnd: any[] = []
        if (f.color) toItemAnd.push({ categoryData: { contains: f.color, mode: 'insensitive' as const } })
        if (f.condition && f.condition !== 'all') toItemAnd.push({ categoryData: { contains: f.condition, mode: 'insensitive' as const } })
        if (f.batchNumber) toItemAnd.push({ categoryData: { contains: f.batchNumber, mode: 'insensitive' as const } })
        if (f.priceRange) toItemAnd.push({ price: { gte: f.priceRange[0], lte: f.priceRange[1] } })
        if (f.quantityRange) toItemAnd.push({ totalQuantity: { gte: Math.floor(f.quantityRange[0]), lte: Math.floor(f.quantityRange[1]) } })
        if (f.purchaseDateFrom || f.purchaseDateTo) toItemAnd.push({ purchaseDate: { ...(f.purchaseDateFrom ? { gte: f.purchaseDateFrom } : {}), ...(f.purchaseDateTo ? { lte: f.purchaseDateTo } : {}) } })
        if (f.lowStock) { toItemAnd.push({ availableQuantity: { lte: 2 } }); toItemAnd.push({ availableQuantity: { gt: 0 } }) }
        if (f.hasProjects) toItemAnd.push({ projectUsage: { some: {} } })
        if (f.availabilityStatus && f.availabilityStatus !== 'all') {
          if (f.availabilityStatus === 'available') toItemAnd.push({ availableQuantity: { gt: 0 } })
          if (f.availabilityStatus === 'low') { toItemAnd.push({ availableQuantity: { gt: 0 } }); toItemAnd.push({ availableQuantity: { lte: 2 } }) }
          if (f.availabilityStatus === 'empty') toItemAnd.push({ availableQuantity: 0 as any })
        }
        if (toItemAnd.length > 0) {
          andClauses.push({
            itemRelationsFrom: {
              some: {
                relationType: 'MASTER_OF',
                toItem: { AND: toItemAnd }
              }
            }
          })
        }
        if (andClauses.length > 0) masterWhere.AND = (masterWhere.AND || []).concat(andClauses)
      }

      const [masters, total] = await Promise.all([
        ctx.db.item.findMany({
          where: masterWhere,
          include: { location: true, category: true },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.item.count({ where: masterWhere })
      ])

      const mastersWithTotals = await Promise.all(masters.map(async (m) => ({
        ...m,
        relatedTo: [],
        totals: await calculateMasterTotals(ctx.db, m.id, ctx.user.id)
      })))

      return { masters: serializeItemsForClient(mastersWithTotals), total }
    }),

  // PROJECT INTEGRATION ENDPOINTS

  // Hent garn-bruk for et spesifikt item
  getYarnUsageForItem: protectedProcedure
    .input(z.object({
      itemId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const usage = await ctx.db.projectYarnUsage.findMany({
        where: {
          itemId: input.itemId,
          project: {
            userId: ctx.user.id
          }
        },
        include: {
          project: true,
          item: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return usage
    }),

  // Fjern garn fra prosjekt - DUPLICATE DISABLED
  removeYarnFromProject2: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      itemId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verifiser at prosjektet tilhører brukeren
      const project = await ctx.db.yarnProject.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.user.id
        }
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prosjekt ikke funnet'
        })
      }

      // Finn og slett bruken
      const usage = await ctx.db.projectYarnUsage.findFirst({
        where: {
          projectId: input.projectId,
          itemId: input.itemId
        }
      })

      if (!usage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Garn-bruk ikke funnet i prosjekt'
        })
      }

      // Oppdater item tilgjengelighet
      const item = await ctx.db.item.findUnique({
        where: { id: input.itemId }
      })

      if (item) {
        await ctx.db.item.update({
          where: { id: input.itemId },
          data: {
            availableQuantity: Number(item.availableQuantity) + Number(usage.quantityUsed)
          }
        })
      }

      // Slett bruken
      await ctx.db.projectYarnUsage.delete({
        where: { id: usage.id }
      })

      return { success: true }
    }),

  // Oppdater garn-bruk i prosjekt
  updateYarnUsageInProject: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      itemId: z.string(),
      quantityUsed: z.number().min(0),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verifiser at prosjektet tilhører brukeren
      const project = await ctx.db.yarnProject.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.user.id
        }
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prosjekt ikke funnet'
        })
      }

      // Finn eksisterende bruk
      const existingUsage = await ctx.db.projectYarnUsage.findFirst({
        where: {
          projectId: input.projectId,
          itemId: input.itemId
        }
      })

      if (!existingUsage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Garn-bruk ikke funnet'
        })
      }

      // Beregn forskjell i mengde
      const quantityDifference = input.quantityUsed - Number(existingUsage.quantityUsed)

      // Sjekk tilgjengelighet hvis vi øker bruken
      if (quantityDifference > 0) {
        const item = await ctx.db.item.findUnique({
          where: { id: input.itemId }
        })

        if (!item || Number(item.availableQuantity) < quantityDifference) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Ikke nok garn tilgjengelig'
          })
        }

        // Oppdater tilgjengelighet
        await ctx.db.item.update({
          where: { id: input.itemId },
          data: {
            availableQuantity: Number(item.availableQuantity) - quantityDifference
          }
        })
      } else if (quantityDifference < 0) {
        // Hvis vi reduserer bruken, gi tilbake til tilgjengelig
        const item = await ctx.db.item.findUnique({
          where: { id: input.itemId }
        })

        if (item) {
          await ctx.db.item.update({
            where: { id: input.itemId },
            data: {
              availableQuantity: Number(item.availableQuantity) - quantityDifference // negativt tall, så vi legger til
            }
          })
        }
      }

      // Oppdater bruken
      const updatedUsage = await ctx.db.projectYarnUsage.update({
        where: { id: existingUsage.id },
        data: {
          quantityUsed: input.quantityUsed,
          notes: input.notes
        },
        include: {
          project: true,
          item: true
        }
      })

      return updatedUsage
    }),

  // Hent alle prosjekter for dropdown - DUPLICATE DISABLED
  getProjects2: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      status: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.user.id,
        ...(input.status && { status: input.status as any })
      }

      const [projects, total] = await Promise.all([
        ctx.db.yarnProject.findMany({
          where,
          include: {
            pattern: true,
            yarnUsage: {
              include: {
                item: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.yarnProject.count({ where })
      ])

      return { projects, total }
    }),

  // ANALYTICS ENDPOINTS

  // Hent garn analytics
  getYarnAnalytics: protectedProcedure
    .input(z.object({
      timeRange: z.number().default(30), // days
      groupBy: z.string().default('producer')
    }))
    .query(async ({ ctx, input }) => {
      const dateThreshold = new Date()
      dateThreshold.setDate(dateThreshold.getDate() - input.timeRange)

      // Get master and batch categories
      const [masterCategory, batchCategory] = await Promise.all([
        ctx.db.category.findFirst({ where: { name: 'Garn Master' } }),
        ctx.db.category.findFirst({ where: { name: 'Garn Batch' } })
      ])

      if (!masterCategory || !batchCategory) {
        return {
          totalMasters: 0,
          uniqueColors: 0,
          topProducers: [],
          topColors: []
        }
      }

      // Get all yarn masters for this user
      const masters = await ctx.db.item.findMany({
        where: {
          userId: ctx.user.id,
          categoryId: masterCategory.id
        },
        select: { id: true, name: true, categoryData: true }
      })

      // Preload typed MASTER_OF relations for all masters
      const masterLinks = await ctx.db.itemRelation.findMany({
        where: { userId: ctx.user.id, relationType: 'MASTER_OF', fromItemId: { in: masters.map(m => m.id) } },
        select: { fromItemId: true, toItemId: true }
      })
      const batchIdsByMaster = new Map<string, string[]>()
      for (const ml of masterLinks) {
        const arr = batchIdsByMaster.get(ml.fromItemId) || []
        arr.push(ml.toItemId)
        batchIdsByMaster.set(ml.fromItemId, arr)
      }

      // Fallback: for master uten typed batches, hent legacy batches
      const mastersNeedingLegacy = masters.filter(m => !(batchIdsByMaster.get(m.id)?.length))
      if (mastersNeedingLegacy.length > 0) {
        const legacyBatches = await ctx.db.item.findMany({
          where: {
            userId: ctx.user.id,
            categoryId: batchCategory.id,
            // relatedItems: { some: { id: { in: mastersNeedingLegacy.map(m => m.id) } } } // Removed - not in schema
          },
          select: { id: true, availableQuantity: true, categoryData: true }
        })
        // fordel per master
        // for (const m of mastersNeedingLegacy) { // Removed - not in schema
        //   const ids = legacyBatches
        //     .filter(b => b.relatedItems.some(r => r.id === m.id))
        //     .map(b => b.id)
        //   if (ids.length > 0) batchIdsByMaster.set(m.id, ids)
        // }
      }

      const allBatchIds = Array.from(new Set(Array.from(batchIdsByMaster.values()).flat()))
      const batchItems = allBatchIds.length > 0 ? await ctx.db.item.findMany({ where: { id: { in: allBatchIds } } }) : []
      const batchMap = new Map(batchItems.map(b => [b.id, b]))

      // Calculate analytics
      const producerStats = new Map<string, { name: string, masterCount: number, totalSkeins: number, totalValue: number }>()
      const colorStats = new Map<string, { name: string, colorCode?: string, batchCount: number, totalSkeins: number, totalValue: number }>()
      const uniqueColors = new Set<string>()

      masters.forEach(master => {
        const masterData = master.categoryData || {}
        const producer = (masterData as any).producer || 'Ukjent'

        if (!producerStats.has(producer)) {
          producerStats.set(producer, {
            name: producer,
            masterCount: 0,
            totalSkeins: 0,
            totalValue: 0
          })
        }

        const stats = producerStats.get(producer)!
        stats.masterCount += 1

        const batchIds = batchIdsByMaster.get(master.id) || []
        batchIds.forEach(bid => {
          const batch = batchMap.get(bid)
          if (!batch) return
          const batchData = batch.categoryData || {}
          const quantity = Number((batchData as any).quantity) || 0
          const pricePerSkein = Number((batchData as any).pricePerSkein) || 0
          stats.totalSkeins += quantity
          stats.totalValue += quantity * pricePerSkein

          if ((batchData as any).color) {
            const colorName = String((batchData as any).color)
            uniqueColors.add(colorName.toLowerCase())
            const key = colorName
            if (!colorStats.has(key)) {
              colorStats.set(key, { name: colorName, colorCode: (batchData as any).colorCode, batchCount: 0, totalSkeins: 0, totalValue: 0 })
            }
            const cs = colorStats.get(key)!
            cs.batchCount += 1
            cs.totalSkeins += quantity
            cs.totalValue += quantity * pricePerSkein
          }
        })
      })

      // Sort and limit results
      const topProducers = Array.from(producerStats.values())
        .sort((a, b) => b.totalSkeins - a.totalSkeins)
        .slice(0, 10)

      const topColors = Array.from(colorStats.values())
        .sort((a, b) => b.totalSkeins - a.totalSkeins)
        .slice(0, 10)

      return {
        totalMasters: masters.length,
        uniqueColors: uniqueColors.size,
        topProducers,
        topColors
      }
    }),

  // Hent stock alerts
  getStockAlerts: protectedProcedure
    .query(async ({ ctx }) => {
      const batchCategory = await ctx.db.category.findFirst({
        where: { name: 'Garn Batch' }
      })

      if (!batchCategory) {
        return {
          lowStockCount: 0,
          lowStockItems: []
        }
      }

      // Find items with low stock (availableQuantity <= 2)
      const lowStockItems = await ctx.db.item.findMany({
        where: {
          userId: ctx.user.id,
          categoryId: batchCategory.id,
          availableQuantity: {
            lte: 2,
            gt: 0
          }
        },
        orderBy: { availableQuantity: 'asc' }
      })

      const processedItems = lowStockItems.map(item => {
        const batchData = item.categoryData || {}
        return {
          ...item,
          batchInfo: {
            color: (batchData as any).color,
            batchNumber: (batchData as any).batchNumber
          },
          stockLevel: Number(item.availableQuantity) <= 1 ? 'CRITICAL' : 'LOW'
        }
      })

      return {
        lowStockCount: lowStockItems.length,
        lowStockItems: processedItems
      }
    }),

  // Hent value analysis
  getValueAnalysis: protectedProcedure
    .input(z.object({ timeRange: z.number().default(30) }).optional())
    .query(async ({ ctx, input }) => {
      const batchCategory = await ctx.db.category.findFirst({
        where: { name: 'Garn Batch' }
      })

      if (!batchCategory) {
        return {
          totalValue: 0,
          valueChange: 0
        }
      }

      const batches = await ctx.db.item.findMany({
        where: {
          userId: ctx.user.id,
          categoryId: batchCategory.id
        }
      })

      let totalValue = 0
      batches.forEach(batch => {
        const batchData = batch.categoryData || {}
        const quantity = (batchData as any).quantity || 0
        const pricePerSkein = (batchData as any).pricePerSkein || 0
        totalValue += quantity * pricePerSkein
      })

      // Beregn prosentvis endring i innkjøpsverdi for valgt periode vs. forrige periode
      const days = input?.timeRange ?? 30
      const now = new Date()
      const currentStart = new Date(now)
      currentStart.setDate(now.getDate() - days)
      const previousStart = new Date(currentStart)
      previousStart.setDate(currentStart.getDate() - days)

      let currentPeriod = 0
      let previousPeriod = 0

      batches.forEach(batch => {
        const batchData = batch.categoryData || {}
        const quantity = (batchData as any).quantity || 0
        const pricePerSkein = (batchData as any).pricePerSkein || 0
        const value = quantity * pricePerSkein
        const purchase = batch.purchaseDate ? new Date(batch.purchaseDate) : undefined
        if (!purchase) return
        if (purchase >= currentStart && purchase <= now) {
          currentPeriod += value
        } else if (purchase >= previousStart && purchase < currentStart) {
          previousPeriod += value
        }
      })

      let valueChange = 0
      if (previousPeriod > 0) {
        valueChange = ((currentPeriod - previousPeriod) / previousPeriod) * 100
      } else if (currentPeriod > 0) {
        valueChange = 100
      } else {
        valueChange = 0
      }

      return {
        totalValue,
        valueChange
      }
    }),

  // Hent usage statistics
  getUsageStatistics: protectedProcedure
    .input(z.object({
      timeRange: z.number().default(30)
    }))
    .query(async ({ ctx, input }) => {
      const dateThreshold = new Date()
      dateThreshold.setDate(dateThreshold.getDate() - input.timeRange)

      // Get active projects
      const [activeProjects, allProjects] = await Promise.all([
        ctx.db.yarnProject.count({
          where: {
            userId: ctx.user.id,
            status: 'IN_PROGRESS'
          }
        }),
        ctx.db.yarnProject.findMany({
          where: {
            userId: ctx.user.id
          },
          include: {
            yarnUsage: {
              include: {
                item: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        })
      ])

      // Calculate project status distribution
      const statusCounts = new Map()
      allProjects.forEach(project => {
        const count = statusCounts.get(project.status) || 0
        statusCounts.set(project.status, count + 1)
      })

      const projectStatusDistribution = Array.from(statusCounts.entries()).map(([status, count]) => ({
        status,
        count,
        percentage: (count / allProjects.length) * 100
      }))

      // Calculate most used yarns
      const yarnUsageMap = new Map()
      allProjects.forEach(project => {
        project.yarnUsage.forEach(usage => {
          const key = usage.item.id
          if (!yarnUsageMap.has(key)) {
            yarnUsageMap.set(key, {
              id: usage.item.id,
              name: usage.item.name,
              producer: (usage.item.categoryData as any)?.producer || 'Ukjent',
              totalUsed: 0,
              projectCount: 0,
              projects: new Set()
            })
          }

          const yarnStat = yarnUsageMap.get(key)
          yarnStat.totalUsed += usage.quantityUsed
          yarnStat.projects.add(project.id)
          yarnStat.projectCount = yarnStat.projects.size
        })
      })

      const mostUsedYarns = Array.from(yarnUsageMap.values())
        .sort((a, b) => b.totalUsed - a.totalUsed)
        .slice(0, 10)

      const projectsUsingYarn = allProjects.filter(p => p.yarnUsage.length > 0).length

      return {
        activeProjects,
        projectsUsingYarn,
        projectStatusDistribution,
        mostUsedYarns
      }
    }),

  // BULK OPERATIONS ENDPOINTS

  // Bulk update batches
  bulkUpdateBatches: protectedProcedure
    .input(z.object({
      itemIds: z.array(z.string()),
      updateData: z.object({
        pricePerSkein: z.number().min(0).optional(),
        condition: z.string().optional(),
        notes: z.string().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const batchCategory = await ctx.db.category.findFirst({
        where: { name: 'Garn Batch' }
      })

      if (!batchCategory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Garn Batch kategori ikke funnet'
        })
      }

      // Verify all items belong to user and are batches
      const items = await ctx.db.item.findMany({
        where: {
          id: { in: input.itemIds },
          userId: ctx.user.id,
          categoryId: batchCategory.id
        }
      })

      if (items.length !== input.itemIds.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'En eller flere items ikke funnet eller tilhører ikke deg'
        })
      }

      // Update each item
      const updatePromises = items.map(async (item) => {
        const currentData = item.categoryData || {}
        const updatedData = { ...(currentData as any) }

        if (input.updateData.pricePerSkein !== undefined) {
          updatedData.pricePerSkein = input.updateData.pricePerSkein
        }
        if (input.updateData.condition !== undefined) {
          updatedData.condition = input.updateData.condition
        }
        if (input.updateData.notes !== undefined) {
          updatedData.notes = input.updateData.notes
        }

        return ctx.db.item.update({
          where: { id: item.id },
          data: {
            categoryData: JSON.stringify(updatedData)
          }
        })
      })

      await Promise.all(updatePromises)

      return { updated: items.length }
    }),

  // Bulk delete items
  bulkDeleteItems: protectedProcedure
    .input(z.object({
      itemIds: z.array(z.string())
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
          message: 'En eller flere items ikke funnet eller tilhører ikke deg'
        })
      }

      // Delete all items
      await ctx.db.item.deleteMany({
        where: {
          id: { in: input.itemIds },
          userId: ctx.user.id
        }
      })

      return { deleted: items.length }
    }),

  // Bulk move items to different location
  bulkMoveItems: protectedProcedure
    .input(z.object({
      itemIds: z.array(z.string()),
      locationId: z.string()
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
          message: 'En eller flere items ikke funnet eller tilhører ikke deg'
        })
      }

      // Update location for all items
      await ctx.db.item.updateMany({
        where: {
          id: { in: input.itemIds },
          userId: ctx.user.id
        },
        data: {
          locationId: input.locationId
        }
      })

      return { moved: items.length }
    }),

  // Hent alle farger på tvers av alle mastere (kompakt oversikt)
  getAllMasterColors: protectedProcedure
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      // Finn alle typed relasjoner master -> color
      const colorLinks = await ctx.db.itemRelation.findMany({
        where: { userId: ctx.user.id, relationType: 'COLOR_OF' },
        select: { fromItemId: true, toItemId: true }
      })

      if (colorLinks.length === 0) {
        // Fallback: ingen typed farger registrert ennå
        const masterCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Master' } })
        const colorCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Farge' } })
        if (!masterCategory || !colorCategory) return []

        const colors = await ctx.db.item.findMany({
          where: { userId: ctx.user.id, categoryId: colorCategory.id },
          select: { id: true, name: true, imageUrl: true, categoryData: true }
        })

        const masters = await ctx.db.item.findMany({ where: { userId: ctx.user.id, categoryId: masterCategory.id }, select: { id: true, name: true } })
        const masterMap = new Map(masters.map(m => [m.id, m]))

        const batchCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Batch' } })

        const results: Array<{ masterId: string, masterName: string, colorId?: string, colorName: string, colorCode?: string, imageUrl?: string, batchCount: number, skeinCount: number }> = []
        for (const c of colors) {
          // const relMaster = c.relatedItems.find(r => r.categoryId === masterCategory.id) // Removed - not in schema
          // if (!relMaster) continue
          // Placeholder logic since relatedItems not in schema
          continue

          // Finn batches koblet til fargen (legacy)
          let batchCount = 0
          let skeinCount = 0
          if (batchCategory) {
            const relBatches = await ctx.db.item.findMany({
              where: {
                userId: ctx.user.id,
                categoryId: batchCategory!.id,
                OR: [
                  // { relatedItems: { some: { id: c.id } } }, // Removed - not in schema
                  // { relatedTo: { some: { id: c.id } } } // Removed - not in schema
                ]
              },
              select: { id: true, availableQuantity: true }
            })
            batchCount = relBatches.length
            skeinCount = relBatches.reduce((sum, b) => sum + Number(b.availableQuantity || 0), 0)
          }

          const colorData = c.categoryData || {}
          // const masterName = masterMap.get(relMaster.id)?.name || 'Ukjent' // Removed - relMaster not defined

          // results.push({ // Removed - relMaster not defined
          //   masterId: relMaster.id,
          //   masterName,
          //   colorId: c.id,
          //   colorName: c.name,
          //   colorCode: (colorData as any).colorCode,
          //   imageUrl: c.imageUrl || undefined,
          //   batchCount,
          //   skeinCount: Math.round(skeinCount)
          // })
        }

        return results
      }

      // Slå opp mastere og farger for typed koblinger
      const masterIds = Array.from(new Set(colorLinks.map(l => l.fromItemId)))
      const colorIds = Array.from(new Set(colorLinks.map(l => l.toItemId)))

      const [masters, colors] = await Promise.all([
        ctx.db.item.findMany({ where: { id: { in: masterIds } }, select: { id: true, name: true } }),
        ctx.db.item.findMany({ where: { id: { in: colorIds } }, select: { id: true, name: true, imageUrl: true, categoryData: true } })
      ])
      const masterMap = new Map(masters.map(m => [m.id, m]))
      const colorMap = new Map(colors.map(c => [c.id, c]))

      // Hent alle typed BATCH_OF relasjoner for disse fargene
      const batchLinks = await ctx.db.itemRelation.findMany({
        where: { userId: ctx.user.id, relationType: 'BATCH_OF', fromItemId: { in: colorIds } },
        select: { fromItemId: true, toItemId: true }
      })
      const batchesByColor = new Map<string, string[]>()
      for (const bl of batchLinks) {
        const arr = batchesByColor.get(bl.fromItemId) || []
        arr.push(bl.toItemId)
        batchesByColor.set(bl.fromItemId, arr)
      }

      // Slå opp batches for å summere tilgjengelige nøster
      const allBatchIds = Array.from(new Set(batchLinks.map(b => b.toItemId)))
      const batchItems = allBatchIds.length > 0
        ? await ctx.db.item.findMany({ where: { id: { in: allBatchIds } }, select: { id: true, availableQuantity: true } })
        : []
      const batchMap = new Map(batchItems.map(b => [b.id, b]))

      const results: Array<{ masterId: string, masterName: string, colorId?: string, colorName: string, colorCode?: string, imageUrl?: string, batchCount: number, skeinCount: number }> = []
      for (const link of colorLinks) {
        const master = masterMap.get(link.fromItemId)
        const color = colorMap.get(link.toItemId)
        if (!master || !color) continue

        const batchIds = batchesByColor.get(color.id) || []
        const skeins = batchIds.reduce((sum, id) => sum + Number(batchMap.get(id)?.availableQuantity || 0), 0)
        const colorData = color.categoryData || {}

        results.push({
          masterId: master.id,
          masterName: master.name,
          colorId: color.id,
          colorName: color.name,
          colorCode: (colorData as any).colorCode,
          imageUrl: color.imageUrl || undefined,
          batchCount: batchIds.length,
          skeinCount: Math.round(skeins)
        })
      }

      return results
    }),

  // Update a yarn master
  updateMaster: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      imageUrl: z.string().optional(),
      categoryData: z.object({
        producer: z.string().optional(),
        composition: z.string().optional(),
        weight: z.string().optional(),
        yardage: z.number().optional(),
        gauge: z.string().optional(),
        needleSize: z.string().optional(),
        careInstructions: z.string().optional(),
        brand: z.string().optional(),
        colorway: z.string().optional(),
        lotNumber: z.string().optional()
      }).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx
      const { id, name, imageUrl, categoryData } = input
      
      // Verify the master exists and belongs to the user
      const existingMaster = await db.item.findFirst({
        where: {
          id,
          userId: user.id
        }
      })
      
      if (!existingMaster) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Garn-type ikke funnet'
        })
      }
      
      // Get existing category data
      let updatedCategoryData = existingMaster.categoryData
      if (categoryData) {
        const existingData = existingMaster.categoryData || {}
        updatedCategoryData = {
          ...(existingData as any),
          ...(categoryData as any)
        }
      }
      
      // Update the master
      const updatedMaster = await db.item.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(categoryData && { categoryData: updatedCategoryData || undefined })
        }
      })
      
      // Update search index if available - TEMPORARILY DISABLED
      // try {
      //   await meilisearchService.updateDocument('items', {
      //     id: updatedMaster.id,
      //     name: updatedMaster.name,
      //     description: updatedMaster.description || undefined,
      //     categoryData: updatedMaster.categoryData || undefined,
      //     imageUrl: updatedMaster.imageUrl
      //   })
      // } catch (searchError) {
      //   console.warn('Failed to update search index:', searchError)
      // }
      
      return updatedMaster
    }),

  // Update a color - DUPLICATE DISABLED
  updateColor2: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      colorCode: z.string().optional(),
      imageUrl: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx
      const { id, name, colorCode, imageUrl } = input
      
      // Verify the color exists and belongs to the user
      const existingColor = await db.item.findFirst({
        where: {
          id,
          userId: user.id
        }
      })
      
      if (!existingColor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Farge ikke funnet'
        })
      }
      
      // Get existing category data
      let updatedCategoryData = existingColor.categoryData
      if (colorCode !== undefined) {
        const existingData = existingColor.categoryData || {}
        updatedCategoryData = {
          ...(existingData as any),
          colorCode
        }
      }
      
      // Update the color
      const updatedColor = await db.item.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(colorCode !== undefined && { categoryData: updatedCategoryData || undefined })
        }
      })
      
      // Update search index if available - TEMPORARILY DISABLED
      // try {
      //   await meilisearchService.updateDocument('items', {
      //     id: updatedColor.id,
      //     name: updatedColor.name,
      //     description: updatedColor.description || undefined,
      //     categoryData: updatedColor.categoryData || undefined,
      //     imageUrl: updatedColor.imageUrl
      //   })
      // } catch (searchError) {
      //   console.warn('Failed to update search index:', searchError)
      // }
      
      return updatedColor
    }),

  // Delete a color and all related batches - DUPLICATE DISABLED
  deleteColor2: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx
      const { id } = input
      
      // First verify the color exists and belongs to the user
      const color = await db.item.findFirst({
        where: {
          id,
          userId: user.id
        }
      })
      
      if (!color) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Farge ikke funnet'
        })
      }
      
      // Get categories for garn system
      const garnColorCategory = await db.category.findFirst({ where: { name: 'Garn Farge' } })
      const garnBatchCategory = await db.category.findFirst({ where: { name: 'Garn Batch' } })
      
      if (!garnColorCategory) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Garn Farge kategori ikke funnet'
        })
      }
      
      // Verify this is actually a yarn color
      if (color.categoryId !== garnColorCategory.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Dette er ikke en garn-farge'
        })
      }
      
      // Track deleted items for search index cleanup
      let deletedBatchIds: string[] = []
      
      try {
        // Start transaction to delete color and related batches
        await db.$transaction(async (tx) => {
          // 1. Find all batches related to this color
          const batchIds: string[] = []
          if (garnBatchCategory) {
            const colorBatches = await tx.itemRelation.findMany({
              where: {
                fromItemId: id,
                userId: user.id
              }
            })
            
            // Filter to only get batches by checking the category of the related items
            for (const relation of colorBatches) {
              const relatedItem = await tx.item.findUnique({
                where: { id: relation.toItemId },
                select: { categoryId: true }
              })
              if (relatedItem && relatedItem.categoryId === garnBatchCategory.id) {
                batchIds.push(relation.toItemId)
              }
            }
          }
          
          // Store for search index cleanup
          deletedBatchIds = [...batchIds]
          
          // 2. Delete all item relations involving this color and batches
          await tx.itemRelation.deleteMany({
            where: {
              OR: [
                { fromItemId: { in: [id, ...batchIds] } },
                { toItemId: { in: [id, ...batchIds] } }
              ],
              userId: user.id
            }
          })
          
          // 3. Delete all item distributions for these items
          await tx.itemDistribution.deleteMany({
            where: {
              itemId: { in: [id, ...batchIds] }
            }
          })
          
          // 4. Delete all loans for these items
          await tx.loan.deleteMany({
            where: {
              itemId: { in: [id, ...batchIds] },
              userId: user.id
            }
          })
          
          // 5. Delete all attachments for these items
          await tx.attachment.deleteMany({
            where: {
              itemId: { in: [id, ...batchIds] }
            }
          })
          
          // 6. Remove items from any tag relationships (skip for now due to schema issues)
          
          // 7. Finally delete all the batches, then the color
          if (batchIds.length > 0) {
            await tx.item.deleteMany({
              where: {
                id: { in: batchIds },
                userId: user.id
              }
            })
          }
          
          await tx.item.delete({
            where: {
              id,
              userId: user.id
            }
          })
        })
        
        // Update search index if available - TEMPORARILY DISABLED
        // try {
        //   await meilisearchService.deleteDocument('items', id)
        //   for (const batchId of deletedBatchIds) {
        //     await meilisearchService.deleteDocument('items', batchId)
        //   }
        // } catch (searchError) {
        //   console.warn('Failed to update search index after delete:', searchError)
        // }
        
        return { success: true }
        
      } catch (error) {
        console.error('Error deleting yarn color:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke slette farge og tilknyttede batches'
        })
      }
    }),

  // Delete a yarn master and all related items
  deleteMaster: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx
      const { id } = input
      
      // First verify the master exists and belongs to the user
      const master = await db.item.findFirst({
        where: {
          id,
          userId: user.id
        }
      })
      
      if (!master) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Garn-type ikke funnet'
        })
      }
      
      // Get categories for garn system
      const garnMasterCategory = await db.category.findFirst({ where: { name: 'Garn Master' } })
      const garnBatchCategory = await db.category.findFirst({ where: { name: 'Garn Batch' } })
      const garnColorCategory = await db.category.findFirst({ where: { name: 'Garn Farge' } })
      
      if (!garnMasterCategory) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Garn Master kategori ikke funnet'
        })
      }
      
      // Verify this is actually a yarn master
      if (master.categoryId !== garnMasterCategory.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Dette er ikke en garn-type'
        })
      }
      
      // Track deleted items for search index cleanup
      let deletedColorIds: string[] = []
      let deletedBatchIds: string[] = []
      
      try {
        // Start transaction to delete everything related to this master
        await db.$transaction(async (tx) => {
          // 1. Find all colors related to this master
          const colorIds: string[] = []
          if (garnColorCategory) {
            const colors = await tx.itemRelation.findMany({
              where: {
                fromItemId: id,
                userId: user.id,
                toItem: {
                  categoryId: garnColorCategory.id
                }
              },
              include: {
                toItem: true
              }
            })
            colorIds.push(...colors.map(r => r.toItemId))
          }
          
          // 2. Find all batches related to this master (either directly or via colors)
          const batchIds: string[] = []
          if (garnBatchCategory) {
            // Batches linked directly to master
            const directBatches = await tx.itemRelation.findMany({
              where: {
                fromItemId: id,
                userId: user.id,
                toItem: {
                  categoryId: garnBatchCategory.id
                }
              },
              include: {
                toItem: true
              }
            })
            batchIds.push(...directBatches.map(r => r.toItemId))
            
            // Batches linked to colors
            for (const colorId of colorIds) {
              const colorBatches = await tx.itemRelation.findMany({
                where: {
                  fromItemId: colorId,
                  userId: user.id
                }
              })
              
              // Filter to only get batches by checking the category of the related items
              for (const relation of colorBatches) {
                const relatedItem = await tx.item.findUnique({
                  where: { id: relation.toItemId },
                  select: { categoryId: true }
                })
                if (relatedItem && relatedItem.categoryId === garnBatchCategory.id) {
                  batchIds.push(relation.toItemId)
                }
              }
            }
          }
          
          // Store for search index cleanup
          deletedColorIds = [...colorIds]
          deletedBatchIds = [...batchIds]
          
          // Create unique list of related IDs
          const allRelatedIds = Array.from(new Set([...colorIds, ...batchIds]))
          
          // 3. Delete all item relations involving these items
          await tx.itemRelation.deleteMany({
            where: {
              OR: [
                { fromItemId: { in: [id, ...allRelatedIds] } },
                { toItemId: { in: [id, ...allRelatedIds] } }
              ],
              userId: user.id
            }
          })
          
          // 4. Delete all item distributions for these items
          await tx.itemDistribution.deleteMany({
            where: {
              itemId: { in: [id, ...allRelatedIds] }
            }
          })
          
          // 5. Delete all loans for these items
          await tx.loan.deleteMany({
            where: {
              itemId: { in: [id, ...allRelatedIds] },
              userId: user.id
            }
          })
          
          // 6. Delete all attachments for these items
          await tx.attachment.deleteMany({
            where: {
              itemId: { in: [id, ...allRelatedIds] }
            }
          })
          
          // 7. Remove items from any tag relationships (skip for now due to schema issues)
          
          // 8. Finally delete all the items (batches, colors, then master)
          await tx.item.deleteMany({
            where: {
              id: { in: allRelatedIds },
              userId: user.id
            }
          })
          
          await tx.item.delete({
            where: {
              id,
              userId: user.id
            }
          })
        })
        
        // Update search index if available - TEMPORARILY DISABLED
        // try {
        //   await meilisearchService.deleteDocument('items', id)
        //   for (const relatedId of [...deletedColorIds, ...deletedBatchIds]) {
        //     await meilisearchService.deleteDocument('items', relatedId)
        //   }
        // } catch (searchError) {
        //   console.warn('Failed to update search index after delete:', searchError)
        // }
        
        return { success: true }
        
      } catch (error) {
        console.error('Error deleting yarn master:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke slette garn-type og tilknyttede elementer'
        })
      }
    }),

  // REMNANT MANAGEMENT ENDPOINTS

  // Create a remnant from an existing batch
  createRemnant: protectedProcedure
    .input(z.object({
      originalBatchId: z.string(),
      remainingAmount: z.number().positive(),
      unit: z.enum(['g', 'm', 'nøste', 'gram', 'meter']),
      condition: z.enum(['Excellent', 'Good', 'Fair', 'Tangled', 'Needs sorting']),
      sourceProjectId: z.string().optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const remnant = await createRemnantFromBatch(
          ctx.db,
          input.originalBatchId,
          ctx.user.id,
          {
            remainingAmount: input.remainingAmount,
            unit: input.unit,
            condition: input.condition,
            sourceProjectId: input.sourceProjectId,
            notes: input.notes
          }
        )

        // Update search index if available - TEMPORARILY DISABLED
        // try {
        //   await meilisearchService.indexDocument({
        //     id: remnant.id,
        //     type: 'item',
        //     name: remnant.name,
        //     description: remnant.description || '',
        //     categoryName: 'Garn Restegarn',
        //     quantity: Number(remnant.availableQuantity),
        //     userId: ctx.user.id,
        //     createdAt: remnant.createdAt.toISOString(),
        //     updatedAt: remnant.updatedAt.toISOString()
        //   })
        // } catch (searchError) {
        //   console.warn('Failed to update search index:', searchError)
        // }

        return remnant
      } catch (error) {
        console.error('Error creating remnant:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette garnrest'
        })
      }
    }),

  // Get all remnants for user
  getRemnants: protectedProcedure
    .input(z.object({
      minAmount: z.number().optional(),
      unit: z.enum(['g', 'm', 'nøste', 'gram', 'meter']).optional(),
      condition: z.enum(['Excellent', 'Good', 'Fair', 'Tangled', 'Needs sorting']).optional(),
      originalBatchId: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const remnants = await getRemnants(ctx.db, ctx.user.id, {
          minAmount: input.minAmount,
          unit: input.unit,
          condition: input.condition,
          originalBatchId: input.originalBatchId
        })

        const total = remnants.length
        const paginatedRemnants = remnants.slice(input.offset, input.offset + input.limit)

        return {
          remnants: paginatedRemnants,
          total,
          hasMore: input.offset + input.limit < total
        }
      } catch (error) {
        console.error('Error getting remnants:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente garnrester'
        })
      }
    }),

  // Get remnant by ID
  getRemnantById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const remnant = await ctx.db.item.findFirst({
          where: {
            id: input,
            userId: ctx.user.id,
            category: { name: 'Garn Restegarn' }
          },
          include: {
            category: true,
            location: true,
            itemRelationsFrom: {
              where: { relationType: 'REMNANT_OF' },
              include: {
                toItem: {
                  include: { category: true }
                }
              }
            },
            projectUsage: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                    status: true
                  }
                }
              }
            }
          }
        })

        if (!remnant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Garnrest ikke funnet'
          })
        }

        return remnant
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Error getting remnant:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente garnrest'
        })
      }
    }),

  // Update remnant
  updateRemnant: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      availableQuantity: z.number().positive().optional(),
      condition: z.enum(['Excellent', 'Good', 'Fair', 'Tangled', 'Needs sorting']).optional(),
      notes: z.string().optional(),
      locationId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const remnant = await ctx.db.item.findFirst({
          where: {
            id: input.id,
            userId: ctx.user.id,
            category: { name: 'Garn Restegarn' }
          }
        })

        if (!remnant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Garnrest ikke funnet'
          })
        }

        const currentData = remnant.categoryData || {}
        const updatedData = {
          ...(currentData as any),
          ...(input.condition && { condition: input.condition }),
          ...(input.notes && { notes: input.notes })
        }

        const updatedRemnant = await ctx.db.item.update({
          where: { id: input.id },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.description && { description: input.description }),
            ...(input.availableQuantity && { availableQuantity: input.availableQuantity }),
            ...(input.locationId && { locationId: input.locationId }),
            categoryData: JSON.stringify(updatedData)
          },
          include: {
            category: true,
            location: true
          }
        })

        // Update search index - TEMPORARILY DISABLED
        // try {
        //   await meilisearchService.indexDocument('items', {
        //     id: updatedRemnant.id,
        //     name: updatedRemnant.name,
        //     description: updatedRemnant.description || '',
        //     category: 'Garn Restegarn',
        //     availableQuantity: updatedRemnant.availableQuantity,
        //     unit: updatedRemnant.unit,
        //     userId: ctx.user.id
        //   })
        // } catch (searchError) {
        //   console.warn('Failed to update search index:', searchError)
        // }

        return updatedRemnant
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Error updating remnant:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere garnrest'
        })
      }
    }),

  // Use remnant in project
  useRemnant: protectedProcedure
    .input(z.object({
      remnantId: z.string(),
      projectId: z.string(),
      amountUsed: z.number().positive(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedRemnant = await useRemnantInProject(
          ctx.db,
          input.remnantId,
          input.projectId,
          input.amountUsed,
          ctx.user.id,
          input.notes
        )

        // Update search index - TEMPORARILY DISABLED
        // try {
        //   await meilisearchService.indexDocument('items', {
        //     id: updatedRemnant.id,
        //     name: updatedRemnant.name,
        //     description: updatedRemnant.description || '',
        //     category: 'Garn Restegarn',
        //     availableQuantity: updatedRemnant.availableQuantity,
        //     unit: updatedRemnant.unit,
        //     userId: ctx.user.id
        //   })
        // } catch (searchError) {
        //   console.warn('Failed to update search index:', searchError)
        // }

        return updatedRemnant
      } catch (error) {
        console.error('Error using remnant:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Kunne ikke bruke garnrest'
        })
      }
    }),

  // Delete remnant
  deleteRemnant: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        const remnant = await ctx.db.item.findFirst({
          where: {
            id: input,
            userId: ctx.user.id,
            category: { name: 'Garn Restegarn' }
          }
        })

        if (!remnant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Garnrest ikke funnet'
          })
        }

        // Delete relations
        await ctx.db.itemRelation.deleteMany({
          where: {
            OR: [
              { fromItemId: input },
              { toItemId: input }
            ],
            userId: ctx.user.id
          }
        })

        // Delete the remnant
        await ctx.db.item.delete({
          where: { id: input }
        })

        // Update search index - TEMPORARILY DISABLED
        // try {
        //   await meilisearchService.deleteDocument('items', input)
        // } catch (searchError) {
        //   console.warn('Failed to update search index:', searchError)
        // }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Error deleting remnant:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke slette garnrest'
        })
      }
    }),

  // Get remnant statistics
  getRemnantStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const stats = await getRemnantStats(ctx.db, ctx.user.id)
        return stats
      } catch (error) {
        console.error('Error getting remnant stats:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente statistikk for garnrester'
        })
      }
    }),

})
