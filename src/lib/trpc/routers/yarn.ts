// Yarn-specific tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

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
    })
})
