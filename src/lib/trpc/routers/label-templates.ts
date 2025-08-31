// Label Templates tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { LabelType, LabelSizeType, TemplateComplexity } from '@prisma/client'

// Input schemas
const createLabelTemplateSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd').max(100, 'Navn kan ikke være lengre enn 100 tegn'),
  description: z.string().optional(),
  type: z.nativeEnum(LabelType).default('QR'),
  size: z.nativeEnum(LabelSizeType).default('STANDARD'),
  width: z.string().optional(), // Bredde i mm
  height: z.string().optional(), // Høyde i mm
  orientation: z.string().optional(), // Orientering: landscape/portrait
  category: z.string().optional(),
  xml: z.string().min(1, 'XML-mal er påkrevd'),
  fieldMapping: z.string().optional(),
  thumbnail: z.string().optional(),
  complexity: z.nativeEnum(TemplateComplexity).default('SIMPLE'),
  estimatedRenderTime: z.number().default(100),
  labelMediaId: z.string().optional(),
  isVisualTemplate: z.boolean().default(false), // Om det er laget med visuell editor
  visualElements: z.any().optional(), // JSON data for visuelle elementer
})

const updateLabelTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  type: z.nativeEnum(LabelType).optional(),
  size: z.nativeEnum(LabelSizeType).optional(),
  width: z.string().optional(), // Bredde i mm
  height: z.string().optional(), // Høyde i mm
  orientation: z.string().optional(), // Orientering: landscape/portrait
  category: z.string().optional(),
  xml: z.string().optional(),
  fieldMapping: z.string().optional(),
  thumbnail: z.string().optional(),
  complexity: z.nativeEnum(TemplateComplexity).optional(),
  isVisualTemplate: z.boolean().optional(), // Om det er laget med visuell editor
  visualElements: z.any().optional(), // JSON data for visuelle elementer
  estimatedRenderTime: z.number().optional(),
  labelMediaId: z.string().optional(),
})

export const labelTemplatesRouter = createTRPCRouter({
  // Hent alle maler for brukeren
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, session } = ctx

      console.log('🔍 labelTemplates.getAll called for user:', session!.user.email, 'ID:', session!.user.id)

      try {
        // Sjekk om brukeren eksisterer
        const user = await db.user.findUnique({
          where: { id: session!.user.id }
        })
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Bruker ikke funnet'
          })
        }
        const templates = await db.labelTemplate.findMany({
          where: { 
            OR: [
              { userId: session!.user.id }, // Brukerens egne maler
              { isSystemDefault: true }      // Systemmaler tilgjengelig for alle
            ],
            deletedAt: null // Ikke vis slettede maler
          },
          include: {
            labelMedia: true,
            _count: {
              select: { printJobs: true }
            }
          },
          orderBy: [
            { isSystemDefault: 'desc' },
            { usageCount: 'desc' },
            { name: 'asc' }
          ]
        })

        console.log('✅ Found', templates.length, 'label templates for user:', session!.user.email)

        return templates
      } catch (error) {
        console.error('❌ Error fetching label templates:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente etikettmaler'
        })
      }
    }),

  // Hent enkelt mal etter ID
  getById: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx

      try {
        const template = await db.labelTemplate.findFirst({
          where: {
            id: input.id,
            userId: session!.user.id,
            deletedAt: null
          },
          include: {
            labelMedia: true,
            parentTemplate: true,
            childTemplates: true,
            _count: {
              select: { printJobs: true }
            }
          }
        })

        if (!template) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Etikettmal ikke funnet'
          })
        }

        return template
      } catch (error) {
        console.error('❌ Error fetching label template:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente etikettmal'
        })
      }
    }),

  // Opprett ny mal
  create: protectedProcedure
    .input(createLabelTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx

      try {
        // Sjekk om navn allerede eksisterer for brukeren
        const existing = await db.labelTemplate.findFirst({
          where: {
            name: input.name,
            userId: session!.user.id,
            deletedAt: null
          }
        })

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Du har allerede en mal med dette navnet'
          })
        }

        const template = await db.labelTemplate.create({
          data: {
            ...input,
            userId: session!.user.id,
            createdBy: session!.user.id,
            updatedBy: session!.user.id,
            version: 1,
            usageCount: 0
          },
          include: {
            labelMedia: true,
            _count: {
              select: { printJobs: true }
            }
          }
        })

        console.log('✅ Created label template:', template.name, 'for user:', session!.user.email)

        return template
      } catch (error) {
        console.error('❌ Error creating label template:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette etikettmal'
        })
      }
    }),

  // Oppdater eksisterende mal
  update: protectedProcedure
    .input(updateLabelTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx
      const { id, ...updateData } = input

      try {
        // Sjekk at malen eksisterer og tilhører brukeren
        const existing = await db.labelTemplate.findFirst({
          where: {
            id,
            userId: session!.user.id,
            deletedAt: null
          }
        })

        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Etikettmal ikke funnet'
          })
        }

        // Sjekk om systemmal (kan ikke endres)
        if (existing.isSystemDefault) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Systemstandardmaler kan ikke endres'
          })
        }

        // Sjekk om nytt navn allerede eksisterer (hvis navn endres)
        if (updateData.name && updateData.name !== existing.name) {
          const nameExists = await db.labelTemplate.findFirst({
            where: {
              name: updateData.name,
              userId: session!.user.id,
              deletedAt: null,
              id: { not: id }
            }
          })

          if (nameExists) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Du har allerede en mal med dette navnet'
            })
          }
        }

        const template = await db.labelTemplate.update({
          where: { id },
          data: {
            ...updateData,
            updatedBy: session!.user.id,
            version: existing.version + 1
          },
          include: {
            labelMedia: true,
            _count: {
              select: { printJobs: true }
            }
          }
        })

        console.log('✅ Updated label template:', template.name, 'for user:', session!.user.email)

        return template
      } catch (error) {
        console.error('❌ Error updating label template:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere etikettmal'
        })
      }
    }),

  // Slett mal (soft delete)
  delete: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx

      try {
        // Sjekk at malen eksisterer og tilhører brukeren
        const existing = await db.labelTemplate.findFirst({
          where: {
            id: input.id,
            userId: session!.user.id,
            deletedAt: null
          }
        })

        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Etikettmal ikke funnet'
          })
        }

        // Sjekk om systemmal (kan ikke slettes)
        if (existing.isSystemDefault) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Systemstandardmaler kan ikke slettes'
          })
        }

        // Soft delete
        await db.labelTemplate.update({
          where: { id: input.id },
          data: {
            deletedAt: new Date(),
            deletedBy: session!.user.id
          }
        })

        console.log('✅ Deleted label template:', existing.name, 'for user:', session!.user.email)

        return { success: true }
      } catch (error) {
        console.error('❌ Error deleting label template:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke slette etikettmal'
        })
      }
    }),

  // Dupliser mal
  duplicate: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(100)
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx

      try {
        // Hent original mal
        const original = await db.labelTemplate.findFirst({
          where: {
            id: input.id,
            userId: session!.user.id,
            deletedAt: null
          }
        })

        if (!original) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Etikettmal ikke funnet'
          })
        }

        // Sjekk om nytt navn allerede eksisterer
        const nameExists = await db.labelTemplate.findFirst({
          where: {
            name: input.name,
            userId: session!.user.id,
            deletedAt: null
          }
        })

        if (nameExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Du har allerede en mal med dette navnet'
          })
        }

        // Opprett kopi
        const duplicate = await db.labelTemplate.create({
          data: {
            name: input.name,
            description: original.description ? `Kopi av ${original.description}` : `Kopi av ${original.name}`,
            type: original.type,
            size: original.size,
            category: original.category,
            xml: original.xml,
            fieldMapping: original.fieldMapping,
            thumbnail: original.thumbnail,
            complexity: original.complexity,
            estimatedRenderTime: original.estimatedRenderTime,
            labelMediaId: original.labelMediaId,
            parentTemplateId: original.id,
            inheritanceLevel: original.inheritanceLevel + 1,
            userId: session!.user.id,
            createdBy: session!.user.id,
            updatedBy: session!.user.id,
            version: 1,
            usageCount: 0,
            isSystemDefault: false
          },
          include: {
            labelMedia: true,
            _count: {
              select: { printJobs: true }
            }
          }
        })

        console.log('✅ Duplicated label template:', duplicate.name, 'for user:', session!.user.email)

        return duplicate
      } catch (error) {
        console.error('❌ Error duplicating label template:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke duplisere etikettmal'
        })
      }
    }),

  // Oppdater bruksstatistikk
  incrementUsage: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx

      try {
        await db.labelTemplate.update({
          where: {
            id: input.id,
            userId: session!.user.id
          },
          data: {
            usageCount: { increment: 1 },
            lastUsedAt: new Date()
          }
        })

        return { success: true }
      } catch (error) {
        console.error('❌ Error incrementing template usage:', error)
        // Ikke kast feil for statistikk-oppdateringer
        return { success: false }
      }
    }),

  // Hent statistikk
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, session } = ctx

      try {
        const stats = await db.labelTemplate.aggregate({
          where: {
            userId: session!.user.id,
            deletedAt: null
          },
          _count: {
            id: true
          },
          _sum: {
            usageCount: true
          }
        })

        const typeStats = await db.labelTemplate.groupBy({
          by: ['type'],
          where: {
            userId: session!.user.id,
            deletedAt: null
          },
          _count: {
            id: true
          }
        })

        return {
          totalTemplates: stats._count.id || 0,
          totalUsage: stats._sum.usageCount || 0,
          byType: typeStats.reduce((acc, stat) => {
            acc[stat.type] = stat._count.id
            return acc
          }, {} as Record<string, number>)
        }
      } catch (error) {
        console.error('❌ Error fetching template stats:', error)
        return {
          totalTemplates: 0,
          totalUsage: 0,
          byType: {}
        }
      }
    }),

  // Eksporter maler som JSON
  exportTemplates: protectedProcedure
    .input(z.object({
      templateIds: z.array(z.string()).optional(),
      includeSystemDefaults: z.boolean().default(false)
    }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx

      try {
        const where: any = {
          deletedAt: null,
          OR: [
            { userId: session!.user.id },
            ...(input.includeSystemDefaults ? [{ isSystemDefault: true }] : [])
          ]
        }
        
        if (input.templateIds && input.templateIds.length > 0) {
          where.id = { in: input.templateIds }
        }
        
        const templates = await db.labelTemplate.findMany({
          where,
          select: {
            name: true,
            description: true,
            type: true,
            size: true,
            category: true,
            xml: true,
            fieldMapping: true,
            complexity: true,
            estimatedRenderTime: true,
            isSystemDefault: true,
            version: true
          }
        })
        
        return {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          templates
        }
      } catch (error) {
        console.error('❌ Error exporting templates:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke eksportere maler'
        })
      }
    }),

  // Importer maler fra JSON
  importTemplates: protectedProcedure
    .input(z.object({
      templates: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        type: z.nativeEnum(LabelType),
        size: z.nativeEnum(LabelSizeType),
        category: z.string().optional(),
        xml: z.string(),
        fieldMapping: z.string().optional(),
        complexity: z.nativeEnum(TemplateComplexity).optional(),
        estimatedRenderTime: z.number().optional()
      })),
      overwriteExisting: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx
      
      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as string[]
      }
      
      try {
        for (const template of input.templates) {
          try {
            // Sjekk om mal med samme navn eksisterer
            const existing = await db.labelTemplate.findFirst({
              where: {
                name: template.name,
                userId: session!.user.id,
                deletedAt: null
              }
            })
            
            if (existing && !input.overwriteExisting) {
              results.skipped++
              continue
            }
            
            if (existing && input.overwriteExisting) {
              // Oppdater eksisterende mal
              await db.labelTemplate.update({
                where: { id: existing.id },
                data: {
                  ...template,
                  userId: session!.user.id,
                  updatedAt: new Date(),
                  version: existing.version + 1,
                  updatedBy: session!.user.id
                }
              })
            } else {
              // Opprett ny mal
              await db.labelTemplate.create({
                data: {
                  ...template,
                  userId: session!.user.id,
                  isSystemDefault: false,
                  usageCount: 0,
                  version: 1,
                  createdBy: session!.user.id
                }
              })
            }
            
            results.imported++
          } catch (error) {
            results.errors.push(`Feil ved import av "${template.name}": ${error instanceof Error ? error.message : 'Ukjent feil'}`)
          }
        }
        
        return results
      } catch (error) {
        console.error('❌ Error importing templates:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke importere maler'
        })
      }
    })
})
