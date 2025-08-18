import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { 
  ImportItemSchema, 
  ImportLocationSchema, 
  ImportCategorySchema,
  importService 
} from '@/lib/import-export/import-service'
import { generateUniqueQRCode } from '@/lib/db'
import { 
  exportService, 
  ExportTemplates,
  type ExportOptions,
  type ExportConfig 
} from '@/lib/import-export/export-service'
import { logActivity } from '@/lib/db'

export const importExportRouter = createTRPCRouter({
  // Import operations
  validateImportFile: protectedProcedure
    .input(z.object({
      type: z.enum(['items', 'locations', 'categories']),
      fileContent: z.string(), // Base64 encoded file content
      fileName: z.string(),
      options: z.object({
        skipDuplicates: z.boolean().default(true),
        updateExisting: z.boolean().default(false),
        createMissingReferences: z.boolean().default(true),
        dryRun: z.boolean().default(true)
      }).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Convert base64 to file
        const buffer = Buffer.from(input.fileContent, 'base64')
        const file = new File([buffer], input.fileName, { 
          type: input.fileName.endsWith('.csv') ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        // Parse and validate file based on type
        let result: any
        if (input.type === 'items') {
          result = await importService.parseFile(file, ImportItemSchema, input.options)
        } else if (input.type === 'locations') {
          result = await importService.parseFile(file, ImportLocationSchema, input.options)
        } else {
          result = await importService.parseFile(file, ImportCategorySchema, input.options)
        }

        // For items, check against existing data
        if (input.type === 'items' && result.data.length > 0) {
          const existingItems = await ctx.db.item.findMany({
            where: { userId: ctx.user.id },
            select: { name: true, id: true }
          })

          const validation = importService.validateImportData(
            result.data, 
            existingItems, 
            'items'
          )

          return {
            ...result,
            validation: {
              valid: validation.valid.length,
              duplicates: validation.duplicates.length,
              errors: validation.errors.length
            }
          }
        }

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Import validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }),

  // Execute import
  executeImport: protectedProcedure
    .input(z.object({
      type: z.enum(['items', 'locations', 'categories']),
      data: z.array(z.any()),
      options: z.object({
        skipDuplicates: z.boolean().default(true),
        updateExisting: z.boolean().default(false),
        createMissingReferences: z.boolean().default(true)
      }).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const tx = await ctx.db.$transaction(async (prisma) => {
        let created = 0
        let updated = 0
        const errors: string[] = []

        if (input.type === 'items') {
          // Import items
          for (const itemData of input.data) {
            try {
              // Find or create category
              let categoryId = null
              if (itemData.categoryName) {
                const category = await prisma.category.findFirst({
                  where: { name: itemData.categoryName }
                })
                if (category) {
                  categoryId = category.id
                } else if (input.options?.createMissingReferences) {
                  const newCategory = await prisma.category.create({
                    data: {
                      name: itemData.categoryName,
                      description: `Auto-created during import`
                    }
                  })
                  categoryId = newCategory.id
                }
              }

              // Find or create location - required for all items
              let locationId: string | null = null
              if (itemData.locationName) {
                const location = await prisma.location.findFirst({
                  where: { 
                    name: itemData.locationName,
                    userId: ctx.user.id 
                  }
                })
                if (location) {
                  locationId = location.id
                } else if (input.options?.createMissingReferences) {
                  // Generate unique QR code
                  const qrCode = await generateUniqueQRCode()
                  const newLocation = await prisma.location.create({
                    data: {
                      name: itemData.locationName,
                      type: 'BOX',
                      qrCode,
                      userId: ctx.user.id
                    }
                  })
                  locationId = newLocation.id
                }
              }

              // Skip items without valid location since locationId is required
              if (!locationId) {
                errors.push(`Item "${itemData.name}" skipped: Missing required location`)
                continue
              }

              // Check for existing item
              const existingItem = await prisma.item.findFirst({
                where: {
                  name: itemData.name,
                  userId: ctx.user.id
                }
              })

              if (existingItem && input.options?.skipDuplicates) {
                continue // Skip duplicate
              }

              const itemPayload = {
                name: itemData.name,
                description: itemData.description,
                totalQuantity: itemData.quantity || 1,
                unit: itemData.unit || 'stk',
                estimatedValue: itemData.price,
                purchaseDate: itemData.purchaseDate ? new Date(itemData.purchaseDate) : null,
                expiryDate: itemData.expiryDate ? new Date(itemData.expiryDate) : null,
                brand: itemData.brand,
                model: itemData.model,
                serialNumber: itemData.serialNumber,
                barcode: itemData.barcode,
                notes: itemData.notes,
                condition: itemData.condition,
                priority: itemData.priority,
                userId: ctx.user.id,
                categoryId,
                locationId
              }

              if (existingItem && input.options?.updateExisting) {
                await prisma.item.update({
                  where: { id: existingItem.id },
                  data: itemPayload
                })
                updated++
              } else if (!existingItem) {
                await prisma.item.create({
                  data: itemPayload
                })
                created++
              }

            } catch (error) {
              errors.push(`Error importing item "${itemData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }
        } else if (input.type === 'locations') {
          // Import locations
          for (const locationData of input.data) {
            try {
              // Find parent location
              let parentId = null
              if (locationData.parentName) {
                const parent = await prisma.location.findFirst({
                  where: {
                    name: locationData.parentName,
                    userId: ctx.user.id
                  }
                })
                if (parent) {
                  parentId = parent.id
                }
              }

              const existingLocation = await prisma.location.findFirst({
                where: {
                  name: locationData.name,
                  userId: ctx.user.id
                }
              })

              if (existingLocation && input.options?.skipDuplicates) {
                continue
              }

              if (existingLocation && input.options?.updateExisting) {
                const updatePayload = {
                  name: locationData.name,
                  description: locationData.description,
                  type: locationData.type || 'OTHER',
                  capacity: locationData.capacity,
                  notes: locationData.notes,
                  parentId
                }
                await prisma.location.update({
                  where: { id: existingLocation.id },
                  data: updatePayload
                })
                updated++
              } else if (!existingLocation) {
                const createPayload = {
                  name: locationData.name,
                  description: locationData.description,
                  type: locationData.type || 'OTHER',
                  capacity: locationData.capacity,
                  notes: locationData.notes,
                  parentId,
                  userId: ctx.user.id,
                  qrCode: await generateUniqueQRCode()
                }
                await prisma.location.create({
                  data: createPayload
                })
                created++
              }

            } catch (error) {
              errors.push(`Error importing location "${locationData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }
        } else if (input.type === 'categories') {
          // Import categories
          for (const categoryData of input.data) {
            try {
              const existingCategory = await prisma.category.findFirst({
                where: { name: categoryData.name }
              })

              const categoryPayload = {
                name: categoryData.name,
                description: categoryData.description,
                icon: categoryData.icon,
                color: categoryData.color
              }

              if (existingCategory && input.options?.skipDuplicates) {
                continue
              }

              if (existingCategory && input.options?.updateExisting) {
                await prisma.category.update({
                  where: { id: existingCategory.id },
                  data: categoryPayload
                })
                updated++
              } else if (!existingCategory) {
                await prisma.category.create({
                  data: categoryPayload
                })
                created++
              }

            } catch (error) {
              errors.push(`Error importing category "${categoryData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }
        }

        return { created, updated, errors }
      })

      // Log import activity
      await logActivity({
        type: 'ITEM_CREATED',
        description: `Imported ${tx.created} ${input.type}, updated ${tx.updated}`,
        userId: ctx.user.id
      })

      return tx
    }),

  // Generate import template
  generateImportTemplate: protectedProcedure
    .input(z.object({
      type: z.enum(['items', 'locations', 'categories']),
      format: z.enum(['csv', 'xlsx']).default('csv')
    }))
    .mutation(async ({ input }) => {
      try {
        const blob = importService.generateTemplate(input.type, input.format)
        const buffer = await blob.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        
        return {
          content: base64,
          filename: `${input.type}_template.${input.format}`,
          mimeType: blob.type
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }),

  // Export data
  exportData: protectedProcedure
    .input(z.object({
      template: z.enum([
        'INVENTORY_FULL',
        'INSURANCE', 
        'EXPIRY_TRACKING',
        'LOCATION_SUMMARY',
        'LOAN_TRACKING'
      ]),
      format: z.enum(['csv', 'xlsx', 'json']).default('csv'),
      filters: z.object({
        categoryId: z.string().optional(),
        locationId: z.string().optional(),
        dateRange: z.object({
          start: z.date().optional(),
          end: z.date().optional()
        }).optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
        condition: z.enum(['NEW', 'USED', 'DAMAGED', 'REPAIR', 'DISPOSED']).optional(),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).optional()
      }).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const config: ExportConfig = { ...ExportTemplates[input.template] }
        
        // Fetch appropriate data based on template
        let data: any[] = []
        
        switch (input.template) {
          case 'INVENTORY_FULL':
          case 'INSURANCE':
          case 'EXPIRY_TRACKING':
            {
              const whereClause: any = { userId: ctx.user.id }
              
              if (input.filters?.categoryId) {
                whereClause.categoryId = input.filters.categoryId
              }
              if (input.filters?.locationId) {
                whereClause.locationId = input.filters.locationId
              }
              if (input.filters?.condition) {
                whereClause.condition = input.filters.condition
              }
              if (input.filters?.priority) {
                whereClause.priority = input.filters.priority
              }
              if (input.filters?.minValue || input.filters?.maxValue) {
                whereClause.estimatedValue = {}
                if (input.filters.minValue) whereClause.estimatedValue.gte = input.filters.minValue
                if (input.filters.maxValue) whereClause.estimatedValue.lte = input.filters.maxValue
              }
              if (input.filters?.dateRange?.start || input.filters?.dateRange?.end) {
                whereClause.createdAt = {}
                if (input.filters.dateRange.start) whereClause.createdAt.gte = input.filters.dateRange.start
                if (input.filters.dateRange.end) whereClause.createdAt.lte = input.filters.dateRange.end
              }

              data = await ctx.db.item.findMany({
                where: whereClause,
                include: {
                  category: true,
                  location: true
                }
              })
            }
            break
            
          case 'LOCATION_SUMMARY':
            data = await ctx.db.location.findMany({
              where: { userId: ctx.user.id },
              include: {
                parent: true,
                _count: {
                  select: { items: true }
                },
                items: {
                  select: { price: true }
                }
              }
            })
            break
            
          case 'LOAN_TRACKING':
            data = await ctx.db.loan.findMany({
              where: { 
                item: { userId: ctx.user.id }
              },
              include: {
                item: true
              }
            })
            break
        }

        const options: ExportOptions = { format: input.format }
        const blob = await exportService.exportData(data, config, options)
        
        const buffer = await blob.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        
        // Log export activity
        await logActivity({
          type: 'ITEM_CREATED', // Use generic type for now
          description: `Exported ${input.template} as ${input.format.toUpperCase()}`,
          userId: ctx.user.id
        })
        
        return {
          content: base64,
          filename: exportService.generateFilename(config, input.format),
          mimeType: blob.type
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }),

  // Get export templates
  getExportTemplates: protectedProcedure
    .query(() => {
      return Object.entries(ExportTemplates).map(([key, config]) => ({
        id: key,
        title: config.title,
        description: config.description,
        fieldCount: config.fields.length
      }))
    }),

  // Get export statistics
  getExportStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        totalItems,
        totalLocations,
        totalCategories,
        activeLoans,
        expiringItems
      ] = await Promise.all([
        ctx.db.item.count({ where: { userId: ctx.user.id } }),
        ctx.db.location.count({ where: { userId: ctx.user.id } }),
        ctx.db.category.count(),
        ctx.db.loan.count({ 
          where: { 
            item: { userId: ctx.user.id },
            status: 'OUT'
          }
        }),
        ctx.db.item.count({
          where: {
            userId: ctx.user.id,
            expiryDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ])

      return {
        totalItems,
        totalLocations,
        totalCategories,
        activeLoans,
        expiringItems
      }
    })
})

