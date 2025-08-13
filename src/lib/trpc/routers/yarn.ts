// Yarn-specific tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import {
  isYarnMaster,
  isYarnBatch,
  getBatchesForMaster,
  getMasterForBatch,
  calculateMasterTotals,
  createBatchForMaster,
  createYarnMaster,
  syncMasterDataToBatches,
  type YarnMasterData,
  type YarnBatchData
} from '../../utils/yarn-helpers'

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

  // Create new pattern
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
      const pattern = await ctx.db.yarnPattern.create({
        data: {
          ...input,
          imageUrls: input.imageUrls ? JSON.stringify(input.imageUrls) : undefined,
          userId: ctx.user.id
        }
      })
      
      return pattern
    }),

  // Update pattern
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
      const { id, ...updateData } = input
      
      const pattern = await ctx.db.yarnPattern.findFirst({
        where: {
          id,
          userId: ctx.user.id
        }
      })
      
      if (!pattern) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Oppskrift ikke funnet'
        })
      }
      
      const { imageUrls, ...otherData } = updateData
      const processedUpdateData = {
        ...otherData,
        ...(imageUrls && { imageUrls: JSON.stringify(imageUrls) })
      }
      
      const updatedPattern = await ctx.db.yarnPattern.update({
        where: { id },
        data: processedUpdateData
      })
      
      return updatedPattern
    }),

  // Delete pattern
  deletePattern: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const pattern = await ctx.db.yarnPattern.findFirst({
        where: {
          id: input,
          userId: ctx.user.id
        },
        include: {
          _count: {
            select: { projects: true }
          }
        }
      })
      
      if (!pattern) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Oppskrift ikke funnet'
        })
      }
      
      if (pattern._count.projects > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Kan ikke slette oppskrift som brukes i ${pattern._count.projects} prosjekt(er)`
        })
      }
      
      await ctx.db.yarnPattern.delete({
        where: { id: input }
      })
      
      return { success: true }
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
      
      // Process image arrays to JSON strings
      const { progressImages, finalImages, ...otherData } = updateData
      const processedUpdateData = {
        ...otherData,
        ...(progressImages && { progressImages: JSON.stringify(progressImages) }),
        ...(finalImages && { finalImages: JSON.stringify(finalImages) })
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
      const master = await createYarnMaster(ctx.db, {
        name: input.name,
        locationId: input.locationId,
        userId: ctx.user.id,
        producer: input.producer,
        composition: input.composition,
        yardage: input.yardage,
        weight: input.weight,
        gauge: input.gauge,
        needleSize: input.needleSize,
        careInstructions: input.careInstructions,
        store: input.store,
        notes: input.notes,
        imageUrl: input.imageUrl,
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
      // Verifiser at master tilhører brukeren
      const master = await ctx.db.item.findFirst({
        where: {
          id: input.masterId,
          userId: ctx.user.id
        },
        include: { category: true }
      })

      if (!master || !isYarnMaster(master.category?.name)) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Garn Master ikke funnet'
        })
      }

      const batch = await createBatchForMaster(ctx.db, input.masterId, {
        name: input.name,
        locationId: input.locationId,
        userId: ctx.user.id,
        batchNumber: input.batchNumber,
        color: input.color,
        colorCode: input.colorCode,
        quantity: input.quantity,
        pricePerSkein: input.pricePerSkein,
        purchaseDate: input.purchaseDate,
        condition: input.condition,
        notes: input.notes,
        imageUrl: input.imageUrl,
        unit: input.unit,
      })

      // Relater til farge hvis oppgitt
      if (input.colorId) {
        await ctx.db.item.update({
          where: { id: batch.id },
          data: {
            relatedItems: {
              connect: { id: input.colorId }
            }
          }
        })
      }

      return batch
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
      // Finn/lag kategori "Garn Farge"
      let colorCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Farge' } })
      if (!colorCategory) {
        colorCategory = await ctx.db.category.create({
          data: {
            name: 'Garn Farge',
            description: 'Fargenivå mellom master og batch',
            fieldSchema: JSON.stringify({
              type: 'object',
              properties: {
                colorCode: { type: 'string', label: 'Fargekode' },
                masterItemId: { type: 'string', label: 'Master', hidden: true }
              }
            })
          }
        })
      }

      const color = await ctx.db.item.create({
        data: {
          name: input.name,
          description: undefined,
          userId: ctx.user.id,
          categoryId: colorCategory.id,
          locationId: (await ctx.db.item.findUnique({ where: { id: input.masterId } }))!.locationId,
          totalQuantity: 0,
          availableQuantity: 0,
          unit: 'nøste',
          imageUrl: input.imageUrl,
          categoryData: JSON.stringify({
            colorCode: input.colorCode,
            masterItemId: input.masterId
          }),
          relatedItems: {
            connect: { id: input.masterId }
          }
        }
      })

      return color
    }),

  // Hent alle farger for en master med summer
  getColorsForMaster: protectedProcedure
    .input(z.object({ masterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [colorCategory, batchCategory] = await Promise.all([
        ctx.db.category.findFirst({ where: { name: 'Garn Farge' } }),
        ctx.db.category.findFirst({ where: { name: 'Garn Batch' } })
      ])

      if (!colorCategory) return []

      const colors = await ctx.db.item.findMany({
        where: {
          userId: ctx.user.id,
          categoryId: colorCategory.id,
          OR: [
            { relatedItems: { some: { id: input.masterId } } },
            { relatedTo: { some: { id: input.masterId } } }
          ]
        }
      })

      if (!batchCategory) {
        return colors.map(c => ({
          id: c.id,
          name: c.name,
          colorCode: safeParseColorCode(c.categoryData),
          batchCount: 0,
          skeinCount: 0
        }))
      }

      const results = [] as Array<{ id: string, name: string, colorCode?: string, batchCount: number, skeinCount: number }>
      for (const color of colors) {
        const batches = await ctx.db.item.findMany({
          where: {
            userId: ctx.user.id,
            categoryId: batchCategory.id,
            OR: [
              { relatedItems: { some: { id: color.id } } },
              { relatedTo: { some: { id: color.id } } }
            ]
          }
        })
        const skeins = batches.reduce((sum, b) => sum + (b.availableQuantity || 0), 0)
        results.push({
          id: color.id,
          name: color.name,
          colorCode: safeParseColorCode(color.categoryData),
          batchCount: batches.length,
          skeinCount: Math.round(skeins)
        })
      }

      return results
    }),

  // Hent alle batches for en farge
  getBatchesForColor: protectedProcedure
    .input(z.object({ colorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const batchCategory = await ctx.db.category.findFirst({ where: { name: 'Garn Batch' } })
      if (!batchCategory) return []
      const batches = await ctx.db.item.findMany({
        where: {
          userId: ctx.user.id,
          categoryId: batchCategory.id,
          OR: [
            { relatedItems: { some: { id: input.colorId } } },
            { relatedTo: { some: { id: input.colorId } } }
          ]
        },
        include: { location: true }
      })
      return batches
    }),

  // Hent alle yarn masters for brukeren
  getAllMasters: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const masterCategory = await ctx.db.category.findFirst({
        where: { name: 'Garn Master' }
      })

      if (!masterCategory) {
        return { masters: [], total: 0 }
      }

      const where = {
        userId: ctx.user.id,
        categoryId: masterCategory.id,
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { description: { contains: input.search, mode: 'insensitive' as const } }
          ]
        })
      }

      const [masters, total] = await Promise.all([
        ctx.db.item.findMany({
          where,
          include: {
            location: true,
            category: true,
            relatedTo: {
              include: {
                category: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.item.count({ where })
      ])

      // Beregn totals for hver master
      const mastersWithTotals = await Promise.all(
        masters.map(async (master) => {
          const totals = await calculateMasterTotals(ctx.db, master.id, ctx.user.id)
          return {
            ...master,
            totals
          }
        })
      )

      return { masters: mastersWithTotals, total }
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

  // Fjern garn fra prosjekt
  removeYarnFromProject: protectedProcedure
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
            availableQuantity: item.availableQuantity + usage.quantityUsed
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
      const quantityDifference = input.quantityUsed - existingUsage.quantityUsed

      // Sjekk tilgjengelighet hvis vi øker bruken
      if (quantityDifference > 0) {
        const item = await ctx.db.item.findUnique({
          where: { id: input.itemId }
        })

        if (!item || item.availableQuantity < quantityDifference) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Ikke nok garn tilgjengelig'
          })
        }

        // Oppdater tilgjengelighet
        await ctx.db.item.update({
          where: { id: input.itemId },
          data: {
            availableQuantity: item.availableQuantity - quantityDifference
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
              availableQuantity: item.availableQuantity - quantityDifference // negativt tall, så vi legger til
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

  // Hent alle prosjekter for dropdown
  getProjects: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      status: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.user.id,
        ...(input.status && { status: input.status })
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
        include: {
          relatedTo: {
            where: {
              categoryId: batchCategory.id
            },
            include: {
              category: true
            }
          }
        }
      })

      // Get all yarn batches for this user
      const batches = await ctx.db.item.findMany({
        where: {
          userId: ctx.user.id,
          categoryId: batchCategory.id
        }
      })

      // Calculate analytics
      const producerStats = new Map()
      const colorStats = new Map()
      const uniqueColors = new Set()

      masters.forEach(master => {
        const masterData = master.categoryData ? JSON.parse(master.categoryData) : {}
        const producer = masterData.producer || 'Ukjent'
        
        if (!producerStats.has(producer)) {
          producerStats.set(producer, {
            name: producer,
            masterCount: 0,
            totalSkeins: 0,
            totalValue: 0
          })
        }

        const stats = producerStats.get(producer)
        stats.masterCount += 1

        // Add batch data
        master.relatedTo.forEach(batch => {
          const batchData = batch.categoryData ? JSON.parse(batch.categoryData) : {}
          stats.totalSkeins += batchData.quantity || 0
          stats.totalValue += (batchData.quantity || 0) * (batchData.pricePerSkein || 0)

          // Track colors
          if (batchData.color) {
            uniqueColors.add(batchData.color.toLowerCase())
            
            if (!colorStats.has(batchData.color)) {
              colorStats.set(batchData.color, {
                name: batchData.color,
                colorCode: batchData.colorCode,
                batchCount: 0,
                totalSkeins: 0,
                totalValue: 0
              })
            }

            const colorStat = colorStats.get(batchData.color)
            colorStat.batchCount += 1
            colorStat.totalSkeins += batchData.quantity || 0
            colorStat.totalValue += (batchData.quantity || 0) * (batchData.pricePerSkein || 0)
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
        const batchData = item.categoryData ? JSON.parse(item.categoryData) : {}
        return {
          ...item,
          batchInfo: {
            color: batchData.color,
            batchNumber: batchData.batchNumber
          },
          stockLevel: item.availableQuantity <= 1 ? 'CRITICAL' : 'LOW'
        }
      })

      return {
        lowStockCount: lowStockItems.length,
        lowStockItems: processedItems
      }
    }),

  // Hent value analysis
  getValueAnalysis: protectedProcedure
    .query(async ({ ctx }) => {
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
        const batchData = batch.categoryData ? JSON.parse(batch.categoryData) : {}
        const quantity = batchData.quantity || 0
        const pricePerSkein = batchData.pricePerSkein || 0
        totalValue += quantity * pricePerSkein
      })

      // For now, we'll simulate value change (in a real app, you'd compare with previous period)
      const valueChange = Math.random() * 20 - 10 // -10% to +10%

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
              producer: usage.item.categoryData ? JSON.parse(usage.item.categoryData).producer : 'Ukjent',
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
        const currentData = item.categoryData ? JSON.parse(item.categoryData) : {}
        const updatedData = { ...currentData }

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

})
