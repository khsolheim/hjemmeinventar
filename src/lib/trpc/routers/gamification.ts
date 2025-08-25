import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const gamificationRouter = createTRPCRouter({
  // Get achievements
  getAchievements: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get achievements data
        const unlockedAchievements = 12
        const achievements = [
          {
            id: 'achievement-1',
            name: 'First Item',
            description: 'Add your first item to inventory',
            points: 100,
            status: 'unlocked',
            claimed: true
          },
          {
            id: 'achievement-2',
            name: 'Organizer',
            description: 'Create 10 categories',
            points: 250,
            status: 'unlocked',
            claimed: false
          },
          {
            id: 'achievement-3',
            name: 'Collector',
            description: 'Add 100 items to inventory',
            points: 500,
            status: 'unlocked',
            claimed: true
          },
          {
            id: 'achievement-4',
            name: 'Photographer',
            description: 'Add photos to 50 items',
            points: 300,
            status: 'locked',
            claimed: false
          },
          {
            id: 'achievement-5',
            name: 'Master Organizer',
            description: 'Create 50 categories',
            points: 750,
            status: 'locked',
            claimed: false
          },
          {
            id: 'achievement-6',
            name: 'Inventory Expert',
            description: 'Add 1000 items to inventory',
            points: 1000,
            status: 'locked',
            claimed: false
          }
        ]

        const achievementCategories = [
          {
            id: 'category-1',
            name: 'Getting Started',
            completed: 3,
            total: 3,
            icon: 'Star'
          },
          {
            id: 'category-2',
            name: 'Organization',
            completed: 1,
            total: 2,
            icon: 'Target'
          },
          {
            id: 'category-3',
            name: 'Collection',
            completed: 1,
            total: 2,
            icon: 'Trophy'
          },
          {
            id: 'category-4',
            name: 'Mastery',
            completed: 0,
            total: 3,
            icon: 'Crown'
          }
        ]

        return {
          unlockedAchievements,
          achievements,
          achievementCategories
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente achievements'
        })
      }
    }),

  // Get leaderboards
  getLeaderboards: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get leaderboards data
        const userRank = 15
        const leaderboards = [
          {
            id: 'leaderboard-1',
            name: 'Total Points',
            type: 'Global',
            rankings: [
              {
                id: 'rank-1',
                name: 'John Doe',
                description: 'Top performer',
                score: 12500,
                points: 12500
              },
              {
                id: 'rank-2',
                name: 'Jane Smith',
                description: 'Consistent achiever',
                score: 11800,
                points: 11800
              },
              {
                id: 'rank-3',
                name: 'Bob Johnson',
                description: 'Rising star',
                score: 11200,
                points: 11200
              },
              {
                id: 'rank-4',
                name: 'Alice Brown',
                description: 'Active user',
                score: 10500,
                points: 10500
              },
              {
                id: 'rank-5',
                name: 'Charlie Wilson',
                description: 'Dedicated organizer',
                score: 9800,
                points: 9800
              }
            ]
          },
          {
            id: 'leaderboard-2',
            name: 'Items Added',
            type: 'Monthly',
            rankings: [
              {
                id: 'rank-6',
                name: 'Sarah Davis',
                description: 'Most items this month',
                score: 245,
                points: 245
              },
              {
                id: 'rank-7',
                name: 'Mike Wilson',
                description: 'Consistent contributor',
                score: 198,
                points: 198
              },
              {
                id: 'rank-8',
                name: 'Lisa Anderson',
                description: 'Active collector',
                score: 156,
                points: 156
              },
              {
                id: 'rank-9',
                name: 'Tom Harris',
                description: 'Regular user',
                score: 134,
                points: 134
              },
              {
                id: 'rank-10',
                name: 'Emma Taylor',
                description: 'Newcomer',
                score: 98,
                points: 98
              }
            ]
          }
        ]

        const leaderboardAnalytics = [
          {
            id: 'analytics-1',
            name: 'Total Participants',
            value: '1,247',
            icon: 'Users'
          },
          {
            id: 'analytics-2',
            name: 'Average Score',
            value: '8,450',
            icon: 'BarChart3'
          },
          {
            id: 'analytics-3',
            name: 'Top Score',
            value: '12,500',
            icon: 'Trophy'
          },
          {
            id: 'analytics-4',
            name: 'Active Users',
            value: '892',
            icon: 'Activity'
          }
        ]

        return {
          userRank,
          leaderboards,
          leaderboardAnalytics
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente leaderboards'
        })
      }
    }),

  // Get progress
  getProgress: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get progress data
        const totalPoints = 3450
        const currentLevel = 8
        const progressItems = [
          {
            id: 'progress-1',
            name: 'Items Added',
            current: 156,
            target: 200,
            description: 'Add 200 items to inventory'
          },
          {
            id: 'progress-2',
            name: 'Categories Created',
            current: 12,
            target: 20,
            description: 'Create 20 categories'
          },
          {
            id: 'progress-3',
            name: 'Photos Added',
            current: 45,
            target: 100,
            description: 'Add photos to 100 items'
          },
          {
            id: 'progress-4',
            name: 'Days Active',
            current: 28,
            target: 30,
            description: 'Use the app for 30 days'
          },
          {
            id: 'progress-5',
            name: 'Achievements Unlocked',
            current: 12,
            target: 25,
            description: 'Unlock 25 achievements'
          }
        ]

        const levelProgress = [
          {
            id: 'level-1',
            level: 8,
            description: 'Current level',
            progress: 75,
            currentXP: 3450,
            requiredXP: 4600,
            completed: false
          },
          {
            id: 'level-2',
            level: 9,
            description: 'Next level',
            progress: 0,
            currentXP: 0,
            requiredXP: 5200,
            completed: false
          },
          {
            id: 'level-3',
            level: 10,
            description: 'Milestone level',
            progress: 0,
            currentXP: 0,
            requiredXP: 6000,
            completed: false
          }
        ]

        return {
          totalPoints,
          currentLevel,
          progressItems,
          levelProgress
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente progress'
        })
      }
    }),

  // Get gamification settings
  getGamificationSettings: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get gamification settings
        const settings = [
          {
            id: 'gamification-enabled',
            key: 'gamificationEnabled',
            name: 'Gamification System',
            enabled: true,
            icon: 'Trophy'
          },
          {
            id: 'achievements-enabled',
            key: 'achievementsEnabled',
            name: 'Achievement System',
            enabled: true,
            icon: 'Award'
          },
          {
            id: 'leaderboards-enabled',
            key: 'leaderboardsEnabled',
            name: 'Leaderboards',
            enabled: true,
            icon: 'Crown'
          },
          {
            id: 'progress-tracking',
            key: 'progressTracking',
            name: 'Progress Tracking',
            enabled: true,
            icon: 'Target'
          },
          {
            id: 'notifications',
            key: 'notifications',
            name: 'Achievement Notifications',
            enabled: true,
            icon: 'Bell'
          },
          {
            id: 'sound-effects',
            key: 'soundEffects',
            name: 'Sound Effects',
            enabled: true,
            icon: 'Volume2'
          }
        ]

        const preferences = [
          {
            id: 'difficulty-level',
            name: 'Difficulty Level',
            value: 'Normal',
            percentage: 75
          },
          {
            id: 'achievement-frequency',
            name: 'Achievement Frequency',
            value: 'Balanced',
            percentage: 80
          },
          {
            id: 'competition-level',
            name: 'Competition Level',
            value: 'Moderate',
            percentage: 65
          },
          {
            id: 'reward-value',
            name: 'Reward Value',
            value: 'High',
            percentage: 90
          }
        ]

        return {
          settings,
          preferences
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente gamification settings'
        })
      }
    }),

  // Claim achievement
  claimAchievement: protectedProcedure
    .input(z.object({
      achievementId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        const { achievementId } = input

        // Claim achievement
        const result = {
          success: true,
          achievementId,
          pointsEarned: 250,
          timestamp: new Date(),
          status: 'Claimed'
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'ACHIEVEMENT_CLAIMED',
            description: 'Achievement claimed',
            userId,
            metadata: {
              achievementId: result.achievementId,
              pointsEarned: result.pointsEarned,
              status: result.status
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke claim achievement'
        })
      }
    }),

  // Unlock achievement
  unlockAchievement: protectedProcedure
    .input(z.object({
      achievementId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        const { achievementId } = input

        // Unlock achievement
        const result = {
          success: true,
          achievementId,
          pointsEarned: 100,
          timestamp: new Date(),
          status: 'Unlocked'
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'ACHIEVEMENT_UNLOCKED',
            description: 'Achievement unlocked',
            userId,
            metadata: {
              achievementId: result.achievementId,
              pointsEarned: result.pointsEarned,
              status: result.status
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke unlock achievement'
        })
      }
    }),

  // Update progress
  updateProgress: protectedProcedure
    .input(z.object({
      progressId: z.string(),
      value: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        const { progressId, value } = input

        // Update progress
        const result = {
          success: true,
          progressId,
          newValue: value,
          timestamp: new Date(),
          levelUp: value >= 100
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'PROGRESS_UPDATED',
            description: 'Progress updated',
            userId,
            metadata: {
              progressId: result.progressId,
              newValue: result.newValue,
              levelUp: result.levelUp
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere progress'
        })
      }
    }),

  // Update gamification settings
  updateSettings: protectedProcedure
    .input(z.object({
      gamificationEnabled: z.boolean().optional(),
      achievementsEnabled: z.boolean().optional(),
      leaderboardsEnabled: z.boolean().optional(),
      progressTracking: z.boolean().optional(),
      notifications: z.boolean().optional(),
      soundEffects: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Update gamification settings
        const result = {
          success: true,
          updatedSettings: input,
          timestamp: new Date()
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'GAMIFICATION_SETTINGS_UPDATED',
            description: 'Gamification settings updated',
            userId,
            metadata: {
              updatedSettings: input
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere gamification settings'
        })
      }
    }),

  // Get gamification statistics
  getGamificationStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get gamification statistics
        const [achievements, leaderboards, progress, settings] = await Promise.all([
          ctx.db.activity.count({
            where: {
              userId,
              type: 'ACHIEVEMENT_UNLOCKED'
            }
          }),
          ctx.db.activity.count({
            where: {
              userId,
              type: 'LEADERBOARD_ENTRY'
            }
          }),
          ctx.db.activity.count({
            where: {
              userId,
              type: 'PROGRESS_UPDATED'
            }
          }),
          ctx.db.activity.count({
            where: {
              userId,
              type: 'GAMIFICATION_SETTINGS_UPDATED'
            }
          })
        ])

        return {
          totalAchievements: achievements,
          totalLeaderboardEntries: leaderboards,
          totalProgressUpdates: progress,
          totalSettingsUpdates: settings
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente gamification statistikk'
        })
      }
    })
})
