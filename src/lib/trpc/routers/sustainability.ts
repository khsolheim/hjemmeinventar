import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const sustainabilityRouter = createTRPCRouter({
  // Get environmental impact
  getEnvironmentalImpact: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's activities for impact calculation
        const activities = await ctx.db.activity.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 100
        })

        // Calculate carbon footprint based on activities
        const carbonFootprint = calculateCarbonFootprint(activities)
        
        // Calculate breakdown by category
        const breakdown = calculateImpactBreakdown(activities)

        return {
          carbonFootprint,
          breakdown,
          trend: calculateTrend(activities)
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente miljøpåvirkning'
        })
      }
    }),

  // Get waste reduction data
  getWasteReduction: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get waste entries
        const wasteEntries = await ctx.db.wasteEntry.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })

        // Calculate waste reduction
        const reductionPercentage = calculateWasteReduction(wasteEntries)
        const reusedItems = wasteEntries.filter(entry => entry.type === 'reused').length

        // Get waste categories
        const categories = [
          {
            name: 'Plast',
            currentAmount: 12.5,
            previousAmount: 18.2,
            reduction: 31.3
          },
          {
            name: 'Papir',
            currentAmount: 8.3,
            previousAmount: 12.1,
            reduction: 31.4
          },
          {
            name: 'Glass',
            currentAmount: 5.2,
            previousAmount: 7.8,
            reduction: 33.3
          },
          {
            name: 'Organisk',
            currentAmount: 15.7,
            previousAmount: 22.4,
            reduction: 29.9
          }
        ]

        return {
          reductionPercentage,
          reusedItems,
          categories
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente avfallsdata'
        })
      }
    }),

  // Get green tips
  getGreenTips: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's sustainability activities
        const userActivities = await ctx.db.activity.findMany({
          where: { 
            userId,
            type: { in: ['SUSTAINABILITY_ACTION', 'WASTE_REDUCTION', 'ENERGY_SAVING'] }
          }
        })

        // Generate personalized tips based on user's activities
        const tips = generatePersonalizedTips(userActivities)

        return tips
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente grønne tips'
        })
      }
    }),

  // Get sustainability goals
  getSustainabilityGoals: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's sustainability goals
        const goals = await ctx.db.sustainabilityGoal.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })

        // Calculate progress for each goal
        const goalsWithProgress = await Promise.all(
          goals.map(async (goal) => {
            const progress = await calculateGoalProgress(goal, userId)
            return {
              id: goal.id,
              name: goal.name,
              description: goal.description,
              target: goal.target,
              progress,
              category: goal.category,
              deadline: goal.deadline
            }
          })
        )

        const completedGoals = goalsWithProgress.filter(goal => goal.progress >= 100).length
        const totalGoals = goalsWithProgress.length

        return {
          goals: goalsWithProgress,
          completedGoals,
          totalGoals
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente bærekraftsmål'
        })
      }
    }),

  // Add waste entry
  addWasteEntry: protectedProcedure
    .input(z.object({
      type: z.enum(['recycled', 'reused', 'composted', 'landfill']),
      amount: z.number(),
      category: z.string(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        const wasteEntry = await ctx.db.wasteEntry.create({
          data: {
            type: input.type,
            amount: input.amount,
            category: input.category,
            description: input.description,
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'WASTE_ENTRY_ADDED',
            description: `Registrerte ${input.amount} kg ${input.category} som ${input.type}`,
            userId,
            metadata: {
              wasteEntryId: wasteEntry.id,
              wasteType: input.type,
              wasteCategory: input.category
            }
          }
        })

        return wasteEntry
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke legge til avfallspost'
        })
      }
    }),

  // Update sustainability goal
  updateGoal: protectedProcedure
    .input(z.object({
      goalId: z.string(),
      progress: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the goal
        const goal = await ctx.db.sustainabilityGoal.findFirst({
          where: {
            id: input.goalId,
            userId
          }
        })

        if (!goal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Bærekraftsmål ikke funnet'
          })
        }

        // Update goal progress
        const updatedGoal = await ctx.db.sustainabilityGoal.update({
          where: { id: input.goalId },
          data: { currentProgress: input.progress }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'SUSTAINABILITY_GOAL_UPDATED',
            description: `Oppdaterte fremdrift for ${goal.name} til ${input.progress}%`,
            userId,
            metadata: {
              goalId: goal.id,
              goalName: goal.name,
              newProgress: input.progress
            }
          }
        })

        return updatedGoal
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere bærekraftsmål'
        })
      }
    }),

  // Get sustainability statistics
  getSustainabilityStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get various sustainability metrics
        const [wasteEntries, goals, activities] = await Promise.all([
          ctx.db.wasteEntry.findMany({ where: { userId } }),
          ctx.db.sustainabilityGoal.findMany({ where: { userId } }),
          ctx.db.activity.findMany({
            where: {
              userId,
              type: { in: ['SUSTAINABILITY_ACTION', 'WASTE_REDUCTION', 'ENERGY_SAVING'] }
            }
          })
        ])

        // Calculate statistics
        const totalWasteReduced = wasteEntries
          .filter(entry => entry.type === 'recycled' || entry.type === 'reused')
          .reduce((sum, entry) => sum + entry.amount, 0)

        const completedGoals = goals.filter(goal => goal.currentProgress >= goal.target).length
        const sustainabilityScore = calculateSustainabilityScore(wasteEntries, goals, activities)

        return {
          totalWasteReduced,
          completedGoals,
          totalGoals: goals.length,
          sustainabilityScore,
          monthlyTrend: calculateMonthlyTrend(activities)
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente bærekraftsstatistikk'
        })
      }
    })
})

// Helper functions
function calculateCarbonFootprint(activities: any[]): number {
  let totalFootprint = 0

  activities.forEach(activity => {
    switch (activity.type) {
      case 'ITEM_ADDED':
        totalFootprint += 2 // Estimated CO2 for item production
        break
      case 'WASTE_ENTRY_ADDED':
        if (activity.metadata?.wasteType === 'landfill') {
          totalFootprint += 5 // CO2 for landfill
        }
        break
      case 'ENERGY_USAGE':
        totalFootprint += activity.metadata?.kwh * 0.5 // CO2 per kWh
        break
      default:
        totalFootprint += 1 // Base activity footprint
    }
  })

  return Math.round(totalFootprint)
}

function calculateImpactBreakdown(activities: any[]): any[] {
  const categories = {
    'Transport': 0,
    'Husholdning': 0,
    'Forbruk': 0,
    'Avfall': 0
  }

  activities.forEach(activity => {
    if (activity.metadata?.category) {
      categories[activity.metadata.category] += 1
    }
  })

  const total = Object.values(categories).reduce((sum: number, count: number) => sum + count, 0)

  return Object.entries(categories).map(([name, count]) => ({
    name,
    impact: Math.round((count / total) * 280), // Estimated monthly total
    percentage: Math.round((count / total) * 100)
  }))
}

function calculateTrend(activities: any[]): string {
  const recentActivities = activities.slice(0, 10)
  const olderActivities = activities.slice(10, 20)

  const recentImpact = calculateCarbonFootprint(recentActivities)
  const olderImpact = calculateCarbonFootprint(olderActivities)

  if (recentImpact < olderImpact * 0.9) return 'decreasing'
  if (recentImpact > olderImpact * 1.1) return 'increasing'
  return 'stable'
}

function calculateWasteReduction(wasteEntries: any[]): number {
  if (wasteEntries.length < 2) return 0

  const currentMonth = wasteEntries.slice(0, 30)
  const previousMonth = wasteEntries.slice(30, 60)

  const currentTotal = currentMonth.reduce((sum, entry) => sum + entry.amount, 0)
  const previousTotal = previousMonth.reduce((sum, entry) => sum + entry.amount, 0)

  if (previousTotal === 0) return 0

  return Math.round(((previousTotal - currentTotal) / previousTotal) * 100)
}

function generatePersonalizedTips(userActivities: any[]): any[] {
  const tips = [
    {
      id: '1',
      title: 'Bruk LED-pærer',
      description: 'Bytt ut tradisjonelle pærer med LED-pærer for å spare energi',
      category: 'energy',
      savings: 15
    },
    {
      id: '2',
      title: 'Gå eller sykle',
      description: 'Velg miljøvennlige transportalternativer når mulig',
      category: 'transport',
      savings: 25
    },
    {
      id: '3',
      title: 'Komposter organisk avfall',
      description: 'Start kompostering for å redusere avfall og lage jordforbedring',
      category: 'waste',
      savings: 10
    },
    {
      id: '4',
      title: 'Kjøp brukt',
      description: 'Vurder brukt før nytt for å redusere miljøpåvirkning',
      category: 'shopping',
      savings: 20
    },
    {
      id: '5',
      title: 'Reduser plastforbruk',
      description: 'Bruk gjenbrukbare poser og flasker',
      category: 'waste',
      savings: 12
    }
  ]

  // Personalize tips based on user activities
  const userCategories = userActivities.map(activity => activity.metadata?.category).filter(Boolean)
  
  return tips.filter(tip => !userCategories.includes(tip.category))
}

async function calculateGoalProgress(goal: any, userId: string): Promise<number> {
  // This would calculate actual progress based on user activities
  // For now, return a random progress
  return Math.min(goal.currentProgress || 0, 100)
}

function calculateSustainabilityScore(wasteEntries: any[], goals: any[], activities: any[]): number {
  let score = 50 // Base score

  // Waste reduction bonus
  const recycledWaste = wasteEntries.filter(entry => entry.type === 'recycled').length
  score += recycledWaste * 2

  // Goal completion bonus
  const completedGoals = goals.filter(goal => goal.currentProgress >= goal.target).length
  score += completedGoals * 10

  // Activity bonus
  const sustainabilityActivities = activities.filter(activity => 
    activity.type.includes('SUSTAINABILITY') || activity.type.includes('WASTE')
  ).length
  score += sustainabilityActivities * 1

  return Math.min(100, Math.max(0, score))
}

function calculateMonthlyTrend(activities: any[]): any {
  const monthlyData = activities.reduce((acc, activity) => {
    const month = new Date(activity.createdAt).toISOString().slice(0, 7)
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  return monthlyData
}
