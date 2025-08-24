import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const gamificationRouter = createTRPCRouter({
  // Get user achievements
  getAchievements: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's items and activities for achievement calculation
        const [items, activities] = await Promise.all([
          ctx.db.item.findMany({
            where: { userId },
            include: { location: true, category: true }
          }),
          ctx.db.activity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
          })
        ])

        // Define achievements
        const achievements = [
          {
            id: 'first-item',
            name: 'Første gjenstand',
            description: 'Legg til din første gjenstand',
            type: 'items',
            rarity: 'common',
            target: 1,
            points: 10,
            progress: items.length,
            claimed: items.length > 0
          },
          {
            id: 'item-collector',
            name: 'Gjenstandssamler',
            description: 'Legg til 10 gjenstander',
            type: 'items',
            rarity: 'common',
            target: 10,
            points: 50,
            progress: items.length,
            claimed: items.length >= 10
          },
          {
            id: 'location-master',
            name: 'Lokasjonsmester',
            description: 'Bruk 5 forskjellige lokasjoner',
            type: 'locations',
            rarity: 'rare',
            target: 5,
            points: 100,
            progress: new Set(items.map(item => item.location?.id)).size,
            claimed: new Set(items.map(item => item.location?.id)).size >= 5
          },
          {
            id: 'streak-7',
            name: 'Ukentlig aktiv',
            description: 'Bruk appen 7 dager på rad',
            type: 'streak',
            rarity: 'epic',
            target: 7,
            points: 200,
            progress: calculateStreak(activities),
            claimed: calculateStreak(activities) >= 7
          },
          {
            id: 'collaborator',
            name: 'Samarbeidspartner',
            description: 'Del 5 gjenstander med andre',
            type: 'collaboration',
            rarity: 'rare',
            target: 5,
            points: 150,
            progress: activities.filter(a => a.type === 'ITEM_SHARED').length,
            claimed: activities.filter(a => a.type === 'ITEM_SHARED').length >= 5
          },
          {
            id: 'efficiency-expert',
            name: 'Effektivitets-ekspert',
            description: 'Legg til 10 gjenstander på én dag',
            type: 'efficiency',
            rarity: 'epic',
            target: 10,
            points: 300,
            progress: calculateMaxItemsPerDay(activities),
            claimed: calculateMaxItemsPerDay(activities) >= 10
          },
          {
            id: 'inventory-master',
            name: 'Inventarmester',
            description: 'Legg til 100 gjenstander',
            type: 'mastery',
            rarity: 'legendary',
            target: 100,
            points: 500,
            progress: items.length,
            claimed: items.length >= 100
          }
        ]

        return achievements
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente prestasjoner'
        })
      }
    }),

  // Get user progress
  getProgress: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's data
        const [items, activities, locations] = await Promise.all([
          ctx.db.item.findMany({ where: { userId } }),
          ctx.db.activity.findMany({ where: { userId } }),
          ctx.db.location.findMany({ where: { userId } })
        ])

        const categories = [
          {
            name: 'Gjenstander',
            description: 'Legg til og organiser gjenstander',
            goals: [
              {
                id: 'total-items',
                name: 'Totale gjenstander',
                description: 'Legg til gjenstander i inventaret',
                target: 50,
                progress: items.length,
                points: 100
              },
              {
                id: 'categorized-items',
                name: 'Kategoriserte gjenstander',
                description: 'Organiser gjenstander i kategorier',
                target: 25,
                progress: items.filter(item => item.categoryId).length,
                points: 75
              }
            ]
          },
          {
            name: 'Lokasjoner',
            description: 'Opprett og bruk lokasjoner',
            goals: [
              {
                id: 'total-locations',
                name: 'Totale lokasjoner',
                description: 'Opprett lokasjoner for organisering',
                target: 10,
                progress: locations.length,
                points: 50
              },
              {
                id: 'items-per-location',
                name: 'Gjenstander per lokasjon',
                description: 'Plasser gjenstander i lokasjoner',
                target: 20,
                progress: Math.max(...locations.map(loc => 
                  items.filter(item => item.locationId === loc.id).length
                ), 0),
                points: 75
              }
            ]
          },
          {
            name: 'Aktivitet',
            description: 'Hold deg aktiv i systemet',
            goals: [
              {
                id: 'daily-streak',
                name: 'Daglig streak',
                description: 'Bruk appen hver dag',
                target: 30,
                progress: calculateStreak(activities),
                points: 200
              },
              {
                id: 'total-activities',
                name: 'Totale aktiviteter',
                description: 'Utfør handlinger i systemet',
                target: 100,
                progress: activities.length,
                points: 150
              }
            ]
          }
        ]

        return { categories }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente fremdrift'
        })
      }
    }),

  // Get leaderboard
  getLeaderboard: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Get all users with their stats
        const users = await ctx.db.user.findMany({
          include: {
            items: true,
            activities: true
          }
        })

        // Calculate points for each user
        const userStats = users.map(user => {
          const totalItems = user.items.length
          const totalActivities = user.activities.length
          const uniqueLocations = new Set(user.items.map(item => item.locationId)).size
          const streak = calculateStreak(user.activities)

          // Calculate points based on various factors
          const points = (
            totalItems * 10 +
            totalActivities * 5 +
            uniqueLocations * 20 +
            streak * 15
          )

          return {
            id: user.id,
            name: user.name,
            level: Math.floor(points / 100) + 1,
            points,
            achievements: Math.floor(points / 50),
            totalItems,
            totalActivities
          }
        })

        // Sort by points and return top 10
        return userStats
          .sort((a, b) => b.points - a.points)
          .slice(0, 10)
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente toppliste'
        })
      }
    }),

  // Get user stats
  getUserStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's data
        const [items, activities, allUsers] = await Promise.all([
          ctx.db.item.findMany({ where: { userId } }),
          ctx.db.activity.findMany({ 
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
          }),
          ctx.db.user.findMany({
            include: {
              items: true,
              activities: true
            }
          })
        ])

        // Calculate stats
        const totalItems = items.length
        const totalActivities = activities.length
        const uniqueLocations = new Set(items.map(item => item.locationId)).size
        const currentStreak = calculateStreak(activities)
        const totalAchievements = 7 // Total number of achievements
        const achievementsUnlocked = calculateUnlockedAchievements(items, activities)

        // Calculate points
        const totalPoints = (
          totalItems * 10 +
          totalActivities * 5 +
          uniqueLocations * 20 +
          currentStreak * 15 +
          achievementsUnlocked * 50
        )

        // Calculate level
        const level = Math.floor(totalPoints / 100) + 1
        const currentXP = totalPoints % 100
        const xpToNext = 100

        // Calculate ranking
        const userRankings = allUsers.map(user => {
          const userItems = user.items.length
          const userActivities = user.activities.length
          const userLocations = new Set(user.items.map(item => item.locationId)).size
          const userStreak = calculateStreak(user.activities)
          
          return {
            id: user.id,
            points: userItems * 10 + userActivities * 5 + userLocations * 20 + userStreak * 15
          }
        }).sort((a, b) => b.points - a.points)

        const ranking = userRankings.findIndex(user => user.id === userId) + 1

        // Recent activity
        const recentActivity = activities.slice(0, 5).map(activity => ({
          description: activity.description,
          timestamp: activity.createdAt,
          points: 5
        }))

        return {
          level,
          currentXP,
          xpToNext,
          totalPoints,
          achievementsUnlocked,
          totalAchievements,
          currentStreak,
          ranking,
          totalUsers: allUsers.length,
          recentActivity
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente brukerstatistikk'
        })
      }
    }),

  // Claim reward
  claimReward: protectedProcedure
    .input(z.object({
      achievementId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Log the reward claim
        await ctx.db.activity.create({
          data: {
            type: 'ACHIEVEMENT_UNLOCKED',
            description: `Prestasjon oppnådd: ${input.achievementId}`,
            userId,
            metadata: {
              achievementId: input.achievementId,
              claimed: true
            }
          }
        })

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke kreve belønning'
        })
      }
    })
})

// Helper functions
function calculateStreak(activities: any[]): number {
  if (activities.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let currentDate = today

  for (let i = 0; i < 30; i++) { // Check last 30 days
    const dayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.createdAt)
      activityDate.setHours(0, 0, 0, 0)
      return activityDate.getTime() === currentDate.getTime()
    })

    if (dayActivities.length > 0) {
      streak++
    } else {
      break
    }

    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}

function calculateMaxItemsPerDay(activities: any[]): number {
  const itemActivities = activities.filter(a => a.type === 'ITEM_CREATED')
  const itemsPerDay: Record<string, number> = {}

  itemActivities.forEach(activity => {
    const date = new Date(activity.createdAt).toDateString()
    itemsPerDay[date] = (itemsPerDay[date] || 0) + 1
  })

  return Math.max(...Object.values(itemsPerDay), 0)
}

function calculateUnlockedAchievements(items: any[], activities: any[]): number {
  const achievements = [
    items.length > 0, // First item
    items.length >= 10, // Item collector
    new Set(items.map(item => item.locationId)).size >= 5, // Location master
    calculateStreak(activities) >= 7, // Weekly active
    activities.filter(a => a.type === 'ITEM_SHARED').length >= 5, // Collaborator
    calculateMaxItemsPerDay(activities) >= 10, // Efficiency expert
    items.length >= 100 // Inventory master
  ]

  return achievements.filter(Boolean).length
}
