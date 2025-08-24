import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const aiRouter = createTRPCRouter({
  // Get AI predictions
  getPredictions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's data for prediction analysis
        const [items, activities, analytics] = await Promise.all([
          ctx.db.item.findMany({ where: { userId } }),
          ctx.db.activity.findMany({ where: { userId } }),
          ctx.db.analytics.findMany({ where: { userId } })
        ])

        // Generate AI predictions based on user data
        const predictions = generatePredictions(items, activities, analytics)

        return predictions
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente AI-prediksjoner'
        })
      }
    }),

  // Get AI automations
  getAutomations: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's AI automations
        const automations = await ctx.db.aiAutomation.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })

        return automations.map(automation => ({
          id: automation.id,
          name: automation.name,
          description: automation.description,
          enabled: automation.enabled,
          triggerCount: automation.triggerCount,
          lastTriggered: automation.lastTriggered,
          confidence: automation.confidence
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente AI-automatiseringer'
        })
      }
    }),

  // Get AI insights
  getInsights: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's data for insight generation
        const [items, activities, analytics] = await Promise.all([
          ctx.db.item.findMany({ where: { userId } }),
          ctx.db.activity.findMany({ where: { userId } }),
          ctx.db.analytics.findMany({ where: { userId } })
        ])

        // Generate AI insights based on user data
        const insights = generateInsights(items, activities, analytics)

        return insights
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente AI-innsikt'
        })
      }
    }),

  // Get AI context
  getContext: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get comprehensive user context for AI
        const [user, items, activities, preferences] = await Promise.all([
          ctx.db.user.findUnique({ where: { id: userId } }),
          ctx.db.item.findMany({ where: { userId } }),
          ctx.db.activity.findMany({ 
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
          }),
          ctx.db.userPreference.findMany({ where: { userId } })
        ])

        return {
          user: {
            id: user?.id,
            name: user?.name,
            preferences: preferences
          },
          inventory: {
            totalItems: items.length,
            categories: items.reduce((acc, item) => {
              acc[item.categoryId || 'uncategorized'] = (acc[item.categoryId || 'uncategorized'] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          },
          recentActivity: activities.slice(0, 10),
          patterns: analyzeUserPatterns(activities)
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente AI-kontekst'
        })
      }
    }),

  // Send message to AI
  sendMessage: protectedProcedure
    .input(z.object({
      message: z.string(),
      context: z.any().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Process message with AI
        const response = await processAIMessage(input.message, input.context, userId)

        // Log the interaction
        await ctx.db.activity.create({
          data: {
            type: 'AI_INTERACTION',
            description: `AI-samtale: ${input.message}`,
            userId,
            metadata: {
              message: input.message,
              response: response.reply,
              confidence: response.confidence
            }
          }
        })

        return response
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke sende melding til AI'
        })
      }
    }),

  // Create AI automation
  createAutomation: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      trigger: z.object({
        type: z.string(),
        conditions: z.any()
      }),
      actions: z.array(z.object({
        type: z.string(),
        parameters: z.any()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        const automation = await ctx.db.aiAutomation.create({
          data: {
            name: input.name,
            description: input.description,
            trigger: input.trigger,
            actions: input.actions,
            enabled: true,
            confidence: 85, // AI confidence score
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'AI_AUTOMATION_CREATED',
            description: `Opprettet AI-automatisering: ${input.name}`,
            userId,
            metadata: {
              automationId: automation.id,
              triggerType: input.trigger.type
            }
          }
        })

        return automation
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette AI-automatisering'
        })
      }
    }),

  // Execute AI action
  executeAction: protectedProcedure
    .input(z.object({
      type: z.string(),
      parameters: z.any()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Execute the AI-suggested action
        const result = await executeAIAction(input.type, input.parameters, userId)

        // Log the action
        await ctx.db.activity.create({
          data: {
            type: 'AI_ACTION_EXECUTED',
            description: `Utførte AI-handling: ${input.type}`,
            userId,
            metadata: {
              actionType: input.type,
              parameters: input.parameters,
              result
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke utføre AI-handling'
        })
      }
    }),

  // Get AI statistics
  getAIStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get AI-related statistics
        const [interactions, automations, predictions] = await Promise.all([
          ctx.db.activity.count({
            where: {
              userId,
              type: 'AI_INTERACTION'
            }
          }),
          ctx.db.aiAutomation.count({ where: { userId } }),
          ctx.db.aiPrediction.count({ where: { userId } })
        ])

        // Calculate AI score
        const aiScore = calculateAIScore(interactions, automations, predictions)

        return {
          totalInteractions: interactions,
          totalAutomations: automations,
          totalPredictions: predictions,
          aiScore,
          accuracy: 94.2 // AI accuracy percentage
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente AI-statistikk'
        })
      }
    })
})

// Helper functions
function generatePredictions(items: any[], activities: any[], analytics: any[]): any[] {
  const predictions = []

  // Inventory predictions
  if (items.length > 0) {
    const lowStockItems = items.filter(item => item.quantity < 2)
    if (lowStockItems.length > 0) {
      predictions.push({
        id: 'low-stock-prediction',
        title: 'Lavt lager',
        description: `${lowStockItems.length} gjenstander trenger påfyll snart`,
        type: 'inventory',
        confidence: 92,
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
      })
    }
  }

  // Shopping predictions
  const recentShopping = activities.filter(a => a.type === 'ITEM_ADDED').length
  if (recentShopping > 5) {
    predictions.push({
      id: 'shopping-pattern',
      title: 'Shopping-mønster',
      description: 'Du handler vanligvis på denne tiden av måneden',
      type: 'shopping',
      confidence: 87,
      expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks
    })
  }

  // Maintenance predictions
  const maintenanceItems = items.filter(item => item.requiresMaintenance)
  if (maintenanceItems.length > 0) {
    predictions.push({
      id: 'maintenance-needed',
      title: 'Vedlikehold nødvendig',
      description: `${maintenanceItems.length} gjenstander trenger vedlikehold`,
      type: 'maintenance',
      confidence: 89,
      expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    })
  }

  // Energy usage predictions
  const energyActivities = activities.filter(a => a.type === 'ENERGY_USAGE')
  if (energyActivities.length > 10) {
    predictions.push({
      id: 'energy-usage',
      title: 'Energibruk',
      description: 'Høyere energibruk enn vanlig denne måneden',
      type: 'energy',
      confidence: 78,
      expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month
    })
  }

  return predictions
}

function generateInsights(items: any[], activities: any[], analytics: any[]): any[] {
  const insights = []

  // Efficiency insights
  const recentActivities = activities.slice(0, 20)
  const efficiencyScore = calculateEfficiencyScore(recentActivities)
  
  if (efficiencyScore < 70) {
    insights.push({
      id: 'efficiency-insight',
      title: 'Forbedre effektivitet',
      description: 'Du kan spare tid ved å organisere gjenstander bedre',
      category: 'efficiency',
      impact: 'medium',
      confidence: 85
    })
  }

  // Savings insights
  const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0)
  if (totalValue > 10000) {
    insights.push({
      id: 'savings-insight',
      title: 'Høy inventarverdi',
      description: `Ditt inventar er verdt ${totalValue.toLocaleString()} kr`,
      category: 'savings',
      impact: 'high',
      confidence: 95
    })
  }

  // Health insights
  const healthItems = items.filter(item => item.category === 'health')
  if (healthItems.length > 5) {
    insights.push({
      id: 'health-insight',
      title: 'God helseorganisering',
      description: 'Du har god oversikt over helserelaterte gjenstander',
      category: 'health',
      impact: 'medium',
      confidence: 88
    })
  }

  // Sustainability insights
  const sustainableItems = items.filter(item => item.sustainable)
  const sustainabilityPercentage = (sustainableItems.length / items.length) * 100
  
  if (sustainabilityPercentage > 60) {
    insights.push({
      id: 'sustainability-insight',
      title: 'Bærekraftig valg',
      description: `${Math.round(sustainabilityPercentage)}% av dine gjenstander er bærekraftige`,
      category: 'sustainability',
      impact: 'high',
      confidence: 92
    })
  }

  return insights
}

function analyzeUserPatterns(activities: any[]): any {
  const patterns = {
    mostActiveTime: 'morning',
    mostActiveDay: 'monday',
    averageDailyActivities: 0,
    commonActions: []
  }

  // Analyze activity patterns
  const timeSlots = activities.reduce((acc, activity) => {
    const hour = new Date(activity.createdAt).getHours()
    if (hour < 12) acc.morning++
    else if (hour < 18) acc.afternoon++
    else acc.evening++
    return acc
  }, { morning: 0, afternoon: 0, evening: 0 })

  patterns.mostActiveTime = Object.entries(timeSlots).reduce((a, b) => a[1] > b[1] ? a : b)[0]
  patterns.averageDailyActivities = Math.round(activities.length / 30) // Assuming 30 days

  return patterns
}

async function processAIMessage(message: string, context: any, userId: string): Promise<any> {
  // Simulate AI processing
  const responses = {
    'hva kan jeg gjøre for å spare energi': {
      reply: 'Basert på dine data kan du spare energi ved å: 1) Bruke LED-pærer, 2) Slå av unødvendig lys, 3) Justere termostaten',
      suggestedActions: [
        { type: 'energy_saving', label: 'Vis energisparingstips', icon: 'Zap' },
        { type: 'create_automation', label: 'Opprett automatisk energisparing', icon: 'Settings' }
      ],
      confidence: 92
    },
    'hvor er min': {
      reply: 'Jeg kan hjelpe deg med å finne gjenstander. Hvilken gjenstand leter du etter?',
      suggestedActions: [
        { type: 'search_items', label: 'Søk i inventar', icon: 'Search' },
        { type: 'show_locations', label: 'Vis alle lokasjoner', icon: 'MapPin' }
      ],
      confidence: 85
    },
    'default': {
      reply: 'Jeg er her for å hjelpe deg med å organisere hjemmet ditt. Hva kan jeg hjelpe deg med?',
      suggestedActions: [
        { type: 'show_dashboard', label: 'Vis oversikt', icon: 'Home' },
        { type: 'add_item', label: 'Legg til gjenstand', icon: 'Plus' }
      ],
      confidence: 90
    }
  }

  const lowerMessage = message.toLowerCase()
  const response = responses[lowerMessage] || responses.default

  return response
}

async function executeAIAction(type: string, parameters: any, userId: string): Promise<any> {
  // Simulate AI action execution
  const actions = {
    'energy_saving': { success: true, message: 'Energisparingstips vist' },
    'create_automation': { success: true, message: 'Automatisering opprettet' },
    'search_items': { success: true, message: 'Søk utført' },
    'show_locations': { success: true, message: 'Lokasjoner vist' },
    'show_dashboard': { success: true, message: 'Oversikt vist' },
    'add_item': { success: true, message: 'Legg til gjenstand vist' }
  }

  return actions[type] || { success: false, message: 'Handling ikke støttet' }
}

function calculateEfficiencyScore(activities: any[]): number {
  // Simple efficiency calculation
  const recentActivities = activities.slice(0, 10)
  const organizedActions = recentActivities.filter(a => 
    a.type === 'ITEM_ORGANIZED' || a.type === 'CATEGORY_CREATED'
  ).length

  return Math.min(100, (organizedActions / recentActivities.length) * 100)
}

function calculateAIScore(interactions: number, automations: number, predictions: number): number {
  // Calculate AI engagement score
  let score = 50 // Base score

  score += Math.min(interactions * 2, 20) // Max 20 points for interactions
  score += Math.min(automations * 5, 20) // Max 20 points for automations
  score += Math.min(predictions * 3, 10) // Max 10 points for predictions

  return Math.min(100, score)
}

