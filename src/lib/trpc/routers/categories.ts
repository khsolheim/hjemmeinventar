// Categories tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../server'

// Predefined category schemas

// GARN MASTER: Felles data for en garntype
const yarnMasterFieldSchema = {
  type: 'object',
  properties: {
    producer: { type: 'string', label: 'Produsent', required: true },
    composition: { type: 'string', label: 'Sammensetning', required: true },
    yardage: { type: 'string', label: 'Løpelengde', placeholder: 'f.eks. 100m' },
    weight: { type: 'string', label: 'Vekt', placeholder: 'f.eks. 50g' },
    gauge: { type: 'string', label: 'Strikkefasthet', placeholder: 'f.eks. 22 masker = 10cm' },
    needleSize: { type: 'string', label: 'Anbefalte pinner', placeholder: 'f.eks. 4.0mm' },
    careInstructions: { type: 'string', label: 'Vaskeråd' },
    store: { type: 'string', label: 'Butikk', placeholder: 'Hvor garnet vanligvis kjøpes' },
    notes: { type: 'textarea', label: 'Notater', placeholder: 'Generelle notater om denne garntypen' }
  },
  required: ['producer', 'composition']
}

// GARN BATCH: Unike data per nøste/batch
const yarnBatchFieldSchema = {
  type: 'object',
  properties: {
    batchNumber: { type: 'string', label: 'Batch nummer', required: true },
    color: { type: 'string', label: 'Farge', required: true },
    colorCode: { type: 'string', label: 'Farge kode', placeholder: 'f.eks. #FF5733 eller navn' },
    quantity: { type: 'number', label: 'Antall nøster', required: true, min: 1 },
    pricePerSkein: { type: 'number', label: 'Pris per nøste (kr)', min: 0, step: 0.01 },
    purchaseDate: { type: 'date', label: 'Kjøpsdato' },
    condition: { 
      type: 'select', 
      label: 'Tilstand',
      options: ['Ny', 'Brukt - god', 'Brukt - ok', 'Brukt - dårlig'],
      default: 'Ny'
    },
    masterItemId: { type: 'string', label: 'Tilhører Master', hidden: true }, // For relasjon til master
    notes: { type: 'textarea', label: 'Batch-notater', placeholder: 'Spesifikke notater for denne batchen' }
  },
  required: ['batchNumber', 'color', 'quantity']
}

// LEGACY: Eksisterende garn schema (beholder for bakoverkompatibilitet)
const yarnFieldSchema = {
  type: 'object',
  properties: {
    producer: { type: 'string', label: 'Produsent' },
    composition: { type: 'string', label: 'Sammensetning' },
    yardage: { type: 'string', label: 'Løpelengde' },
    weight: { type: 'string', label: 'Vekt' },
    gauge: { type: 'string', label: 'Strikkefasthet' },
    needleSize: { type: 'string', label: 'Anbefalte pinner' },
    careInstructions: { type: 'string', label: 'Vaskeråd' },
    assignedProject: { type: 'string', label: 'Tilknyttet prosjekt' },
    condition: { 
      type: 'select', 
      label: 'Tilstand',
      options: ['Ny', 'Brukt - god', 'Brukt - ok', 'Brukt - dårlig']
    },
    store: { type: 'string', label: 'Butikk' },
    pricePerSkein: { type: 'number', label: 'Pris per nøste' }
  },
  required: ['producer', 'composition']
}

const electronicsFieldSchema = {
  type: 'object',
  properties: {
    brand: { type: 'string', label: 'Merke' },
    model: { type: 'string', label: 'Modell' },
    serialNumber: { type: 'string', label: 'Serienummer' },
    warrantyExpiry: { type: 'date', label: 'Garanti utløper' },
    condition: { 
      type: 'select', 
      label: 'Tilstand',
      options: ['Ny', 'Som ny', 'God', 'Brukbar', 'Defekt']
    },
    accessories: { type: 'string', label: 'Tilbehør inkludert' }
  }
}

const foodFieldSchema = {
  type: 'object',
  properties: {
    brand: { type: 'string', label: 'Merke' },
    nutritionInfo: { type: 'string', label: 'Næringsinnhold' },
    allergens: { type: 'string', label: 'Allergener' },
    storage: { 
      type: 'select', 
      label: 'Oppbevaring',
      options: ['Kjøleskap', 'Fryser', 'Tørt og kjølig', 'Romtemperatur']
    },
    opened: { type: 'boolean', label: 'Åpnet' },
    openedDate: { type: 'date', label: 'Åpnet dato' }
  }
}

export const categoriesRouter = createTRPCRouter({
  // Get all categories (public - predefined categories)
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const categories = await ctx.db.category.findMany({
        include: {
          _count: { select: { items: true } }
        },
        orderBy: { name: 'asc' }
      })
      
      return categories
    }),

  // Get category by ID
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input },
        include: {
          items: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          _count: { select: { items: true } }
        }
      })
      
      return category
    }),

  // Get field schema for a category
  getFieldSchema: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input },
        select: { fieldSchema: true, name: true }
      })
      
      return category
    }),

  // Initialize default categories (admin function)
  initializeDefaults: publicProcedure
    .mutation(async ({ ctx }) => {
      const defaultCategories = [
        {
          name: 'Garn Master',
          description: 'Garn-typer med felles egenskaper (produsent, sammensetning, etc.)',
          icon: '🧶',
          fieldSchema: yarnMasterFieldSchema
        },
        {
          name: 'Garn Batch',
          description: 'Individuelle nøster/batcher med unike egenskaper (farge, batch nr, etc.)',
          icon: '🎨',
          fieldSchema: yarnBatchFieldSchema
        },
        {
          name: 'Garn og Strikking',
          description: 'Garn, oppskrifter og strikkeutstyr (legacy)',
          icon: '🧶',
          fieldSchema: yarnFieldSchema
        },
        {
          name: 'Elektronikk',
          description: 'Datautstyr, telefoner og elektroniske enheter',
          icon: '💻',
          fieldSchema: {
            type: 'object',
            properties: {
              brand: { type: 'string', label: 'Merke' },
              model: { type: 'string', label: 'Modell' },
              serialNumber: { type: 'string', label: 'Serienummer' },
              warrantyExpiry: { type: 'date', label: 'Garanti utløper' },
              condition: { 
                type: 'select', 
                label: 'Tilstand',
                options: ['Ny', 'Som ny', 'God', 'Brukbar', 'Defekt']
              },
              accessories: { type: 'string', label: 'Tilbehør inkludert' }
            }
          }
        },
        {
          name: 'Mat og Drikke',
          description: 'Matvarer, krydder og drikkevarer',
          icon: '🍎',
          fieldSchema: {
            type: 'object',
            properties: {
              brand: { type: 'string', label: 'Merke' },
              nutritionInfo: { type: 'string', label: 'Næringsinnhold' },
              allergens: { type: 'string', label: 'Allergener' },
              storage: { 
                type: 'select', 
                label: 'Oppbevaring',
                options: ['Kjøleskap', 'Fryser', 'Tørt og kjølig', 'Romtemperatur']
              },
              opened: { type: 'boolean', label: 'Åpnet' },
              openedDate: { type: 'date', label: 'Åpnet dato' }
            }
          }
        },
        {
          name: 'Klær og Tekstiler',
          description: 'Klær, sko og tekstiler',
          icon: '👕',
          fieldSchema: {
            type: 'object',
            properties: {
              size: { type: 'string', label: 'Størrelse' },
              color: { type: 'string', label: 'Farge' },
              material: { type: 'string', label: 'Materiale' },
              season: { 
                type: 'select', 
                label: 'Sesong',
                options: ['Vinter', 'Vår', 'Sommer', 'Høst', 'Året rundt']
              }
            }
          }
        },
        {
          name: 'Verktøy og Utstyr',
          description: 'Håndverktøy, elektriske verktøy og utstyr',
          icon: '🔧',
          fieldSchema: {
            type: 'object',
            properties: {
              brand: { type: 'string', label: 'Merke' },
              model: { type: 'string', label: 'Modell' },
              condition: { 
                type: 'select', 
                label: 'Tilstand',
                options: ['Ny', 'God', 'Brukbar', 'Trenger service', 'Defekt']
              },
              lastMaintenance: { type: 'date', label: 'Sist vedlikeholdt' },
              manual: { type: 'string', label: 'Bruksanvisning URL' }
            }
          }
        },
        {
          name: 'Bøker og Medier',
          description: 'Bøker, filmer, spill og andre medier',
          icon: '📚',
          fieldSchema: {
            type: 'object',
            properties: {
              author: { type: 'string', label: 'Forfatter/Skaper' },
              isbn: { type: 'string', label: 'ISBN/ID' },
              genre: { type: 'string', label: 'Sjanger' },
              format: { 
                type: 'select', 
                label: 'Format',
                options: ['Fysisk bok', 'E-bok', 'DVD', 'Blu-ray', 'Digital', 'Vinyl', 'CD']
              },
              rating: { 
                type: 'select', 
                label: 'Vurdering',
                options: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']
              }
            }
          }
        },
        {
          name: 'Hobby og Kreativt',
          description: 'Hobbymaterialer, kunst og kreative prosjekter',
          icon: '🎨',
          fieldSchema: {
            type: 'object',
            properties: {
              medium: { type: 'string', label: 'Medium/Type' },
              brand: { type: 'string', label: 'Merke' },
              color: { type: 'string', label: 'Farge' },
              project: { type: 'string', label: 'Tilknyttet prosjekt' },
              skill_level: { 
                type: 'select', 
                label: 'Ferdighetsnivå',
                options: ['Nybegynner', 'Middels', 'Avansert', 'Ekspert']
              }
            }
          }
        },
        {
          name: 'Helse og Skjønnhet',
          description: 'Kosmetikk, medisiner og helseprodukter',
          icon: '💄',
          fieldSchema: {
            type: 'object',
            properties: {
              brand: { type: 'string', label: 'Merke' },
              shade: { type: 'string', label: 'Nyanse/Farge' },
              spf: { type: 'number', label: 'SPF-faktor' },
              skinType: { 
                type: 'select', 
                label: 'Hudtype',
                options: ['Normal', 'Tørr', 'Fet', 'Kombinert', 'Sensitiv']
              },
              opened: { type: 'boolean', label: 'Åpnet' }
            }
          }
        }
      ]
      
      const created = []
      
      for (const categoryData of defaultCategories) {
        const existing = await ctx.db.category.findFirst({
          where: { name: categoryData.name }
        })
        
        if (!existing) {
          const category = await ctx.db.category.create({
            data: {
              ...categoryData,
              fieldSchema: categoryData.fieldSchema ? JSON.stringify(categoryData.fieldSchema) : null
            }
          })
          created.push(category)
        }
      }
      
      return { 
        message: `Opprettet ${created.length} nye kategorier`,
        created: created.map(c => c.name)
      }
    }),

  // Get items in category with user filter
  getItems: protectedProcedure
    .input(z.object({
      categoryId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const [items, total] = await Promise.all([
        ctx.db.item.findMany({
          where: {
            categoryId: input.categoryId,
            userId: ctx.user.id
          },
          include: {
            location: true,
            tags: true
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.item.count({
          where: {
            categoryId: input.categoryId,
            userId: ctx.user.id
          }
        })
      ])
      
      return { items, total }
    }),

  // Get category statistics for user
  getStats: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.item.groupBy({
        by: ['categoryData'],
        where: {
          categoryId: input,
          userId: ctx.user.id
        },
        _count: true,
        _sum: {
          availableQuantity: true,
          totalQuantity: true
        }
      })
      
      const totalItems = await ctx.db.item.count({
        where: {
          categoryId: input,
          userId: ctx.user.id
        }
      })
      
      const totalValue = await ctx.db.item.aggregate({
        where: {
          categoryId: input,
          userId: ctx.user.id,
          price: { not: null }
        },
        _sum: { price: true }
      })
      
      return {
        totalItems,
        totalValue: totalValue._sum.price || 0,
        fieldStats: stats
      }
    }),

  // Update category field schema
  updateFieldSchema: protectedProcedure
    .input(z.object({
      categoryId: z.string(),
      fieldSchema: z.any().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify this is a user's custom category or allow updating predefined ones
      // For now, we'll allow updating any category that exists
      const existingCategory = await ctx.db.category.findUnique({
        where: { id: input.categoryId }
      })
      
      if (!existingCategory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kategori ikke funnet'
        })
      }
      
      // Convert fieldSchema to string if it's an object
      const fieldSchemaString = input.fieldSchema 
        ? JSON.stringify(input.fieldSchema)
        : null
      
      const updatedCategory = await ctx.db.category.update({
        where: { id: input.categoryId },
        data: {
          fieldSchema: fieldSchemaString
        },
        include: {
          _count: { select: { items: true } }
        }
      })
      
      return updatedCategory
    }),

  // Create custom category
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, 'Navn er påkrevd'),
      description: z.string().optional(),
      icon: z.string().optional(),
      fieldSchema: z.any().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Convert fieldSchema to string if it's an object
      const fieldSchemaString = input.fieldSchema 
        ? JSON.stringify(input.fieldSchema)
        : null
      
      const category = await ctx.db.category.create({
        data: {
          name: input.name,
          description: input.description,
          icon: input.icon,
          fieldSchema: fieldSchemaString
        },
        include: {
          _count: { select: { items: true } }
        }
      })
      
      return category
    }),

  // Update category basic info
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, 'Navn er påkrevd').optional(),
      description: z.string().optional(),
      icon: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      
      const existingCategory = await ctx.db.category.findUnique({
        where: { id }
      })
      
      if (!existingCategory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kategori ikke funnet'
        })
      }
      
      const updatedCategory = await ctx.db.category.update({
        where: { id },
        data: updateData,
        include: {
          _count: { select: { items: true } }
        }
      })
      
      return updatedCategory
    })
})
