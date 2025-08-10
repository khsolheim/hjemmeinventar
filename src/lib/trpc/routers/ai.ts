import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { aiService } from '@/lib/ai/ai-service'
import { TRPCError } from '@trpc/server'

export const aiRouter = createTRPCRouter({
  // Check if AI features are enabled
  isEnabled: protectedProcedure
    .query(async () => {
      return { enabled: aiService.isAIEnabled() }
    }),

  // Smart category suggestion
  suggestCategory: protectedProcedure
    .input(z.object({
      itemName: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!aiService.isAIEnabled()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'AI features er ikke aktivert. Sett OPENAI_API_KEY i miljøvariabler.'
        })
      }

      const suggestion = await aiService.suggestCategory(input.itemName, input.description)
      return suggestion
    }),

  // Smart tag suggestions
  suggestTags: protectedProcedure
    .input(z.object({
      itemName: z.string().min(1),
      description: z.string().optional(),
      categoryName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!aiService.isAIEnabled()) {
        return [] // Gracefully return empty array if AI not available
      }

      const tags = await aiService.suggestTags(
        input.itemName, 
        input.description, 
        input.categoryName
      )
      return tags
    }),

  // Optimal location suggestion
  suggestLocation: protectedProcedure
    .input(z.object({
      itemName: z.string().min(1),
      categoryName: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!aiService.isAIEnabled()) {
        return null
      }

      const suggestion = await aiService.suggestLocation(
        input.itemName,
        input.categoryName,
        input.description
      )
      return suggestion
    }),

  // Duplicate detection
  detectDuplicates: protectedProcedure
    .input(z.object({
      itemName: z.string().min(1),
      description: z.string().optional(),
      categoryId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!aiService.isAIEnabled()) {
        return []
      }

      const duplicates = await aiService.detectDuplicates(
        input.itemName,
        input.description,
        input.categoryId
      )
      return duplicates
    }),

  // Generate inventory insights
  generateInsights: protectedProcedure
    .query(async ({ ctx }) => {
      if (!aiService.isAIEnabled()) {
        return []
      }

      const insights = await aiService.generateInsights(ctx.user.id)
      return insights
    }),

  // Enhance search query
  enhanceSearchQuery: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      context: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!aiService.isAIEnabled()) {
        return input.query
      }

      const enhanced = await aiService.enhanceSearchQuery(input.query, input.context)
      return enhanced
    }),

  // Batch suggestions for new item
  getBatchSuggestions: protectedProcedure
    .input(z.object({
      itemName: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!aiService.isAIEnabled()) {
        return {
          category: null,
          location: null,
          tags: [],
          duplicates: []
        }
      }

      try {
        // Run all AI suggestions in parallel for better performance
        const [category, tags, duplicates] = await Promise.all([
          aiService.suggestCategory(input.itemName, input.description),
          aiService.suggestTags(input.itemName, input.description),
          aiService.detectDuplicates(input.itemName, input.description)
        ])

        // Get location suggestion with category info if available
        const location = await aiService.suggestLocation(
          input.itemName,
          category?.categoryName,
          input.description
        )

        return {
          category,
          location,
          tags,
          duplicates
        }
      } catch (error) {
        console.error('Batch AI suggestions failed:', error)
        return {
          category: null,
          location: null,
          tags: [],
          duplicates: []
        }
      }
    }),

  // Smart inventory analysis
  analyzeInventory: protectedProcedure
    .input(z.object({
      analysisType: z.enum(['overview', 'optimization', 'predictions', 'maintenance']).optional().default('overview')
    }))
    .query(async ({ ctx, input }) => {
      if (!aiService.isAIEnabled()) {
        return {
          analysis: 'AI-analyse er ikke tilgjengelig. Aktiver AI-funksjoner ved å sette OPENAI_API_KEY.',
          suggestions: [],
          metrics: {}
        }
      }

      try {
        // Get user's inventory data
        const [items, activities, categories, locations] = await Promise.all([
          ctx.db.item.findMany({
            where: { userId: ctx.user.id },
            include: { 
              category: true, 
              location: true,
              distributions: true
            }
          }),
          ctx.db.activity.findMany({
            where: { userId: ctx.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
          }),
          ctx.db.category.findMany(),
          ctx.db.location.findMany({ where: { userId: ctx.user.id } })
        ])

        // Calculate basic metrics
        const metrics = {
          totalItems: items.length,
          categoriesUsed: new Set(items.map(i => i.categoryId)).size,
          locationsUsed: new Set(items.map(i => i.locationId)).size,
          recentActivityCount: activities.filter(a => 
            a.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length,
          itemsWithoutLocation: items.filter(i => !i.locationId).length,
          expiringItems: items.filter(i => 
            i.expiryDate && i.expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ).length
        }

        // Generate insights based on analysis type
        const insights = await aiService.generateInsights(ctx.user.id)

        return {
          analysis: `Ditt inventar har ${metrics.totalItems} gjenstander fordelt på ${metrics.categoriesUsed} kategorier og ${metrics.locationsUsed} lokasjoner.`,
          suggestions: insights,
          metrics
        }
      } catch (error) {
        console.error('Inventory analysis failed:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke analysere inventaret'
        })
      }
    }),
})

