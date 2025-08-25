import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'

export const healthRouter = createTRPCRouter({
  // Get wellness data
  getWellnessData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock wellness data
      const wellnessData = {
        wellnessScore: 85,
        metrics: [
          {
            id: 'sleep',
            name: 'Sleep Quality',
            description: 'Track your sleep patterns and quality',
            value: 7.5,
            unit: 'hours',
            status: 'excellent',
            icon: 'Bed'
          },
          {
            id: 'stress',
            name: 'Stress Level',
            description: 'Monitor your stress levels',
            value: 3,
            unit: '/10',
            status: 'good',
            icon: 'Brain'
          },
          {
            id: 'hydration',
            name: 'Hydration',
            description: 'Track your daily water intake',
            value: 2.5,
            unit: 'liters',
            status: 'good',
            icon: 'Droplets'
          },
          {
            id: 'nutrition',
            name: 'Nutrition',
            description: 'Monitor your nutritional intake',
            value: 8,
            unit: '/10',
            status: 'excellent',
            icon: 'Utensils'
          }
        ],
        categories: [
          {
            id: 'physical',
            name: 'Physical Health',
            score: 88,
            icon: 'Activity'
          },
          {
            id: 'mental',
            name: 'Mental Health',
            score: 82,
            icon: 'Brain'
          },
          {
            id: 'social',
            name: 'Social Wellness',
            score: 75,
            icon: 'Users'
          },
          {
            id: 'environmental',
            name: 'Environmental',
            score: 90,
            icon: 'Globe'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'HEALTH_WELLNESS_VIEWED',
          description: 'Viewed wellness data',
          metadata: { wellnessScore: wellnessData.wellnessScore }
        }
      })

      return wellnessData
    }),

  // Get fitness data
  getFitnessData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock fitness data
      const fitnessData = {
        fitnessLevel: 72,
        workouts: [
          {
            id: 'running',
            name: 'Running',
            description: 'Cardio workout',
            duration: '30 min',
            calories: 300,
            completed: true,
            icon: 'Running'
          },
          {
            id: 'strength',
            name: 'Strength Training',
            description: 'Weight lifting session',
            duration: '45 min',
            calories: 250,
            completed: false,
            icon: 'Dumbbell'
          },
          {
            id: 'yoga',
            name: 'Yoga',
            description: 'Flexibility and balance',
            duration: '60 min',
            calories: 150,
            completed: true,
            icon: 'Yoga'
          },
          {
            id: 'swimming',
            name: 'Swimming',
            description: 'Low impact cardio',
            duration: '40 min',
            calories: 400,
            completed: false,
            icon: 'Swimming'
          }
        ],
        fitnessAnalytics: [
          {
            id: 'weekly_workouts',
            name: 'Weekly Workouts',
            value: '4/7',
            icon: 'Calendar'
          },
          {
            id: 'calories_burned',
            name: 'Calories Burned',
            value: '1,200',
            icon: 'Activity'
          },
          {
            id: 'active_minutes',
            name: 'Active Minutes',
            value: '175',
            icon: 'Clock'
          },
          {
            id: 'streak',
            name: 'Workout Streak',
            value: '5 days',
            icon: 'TrendingUp'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'HEALTH_FITNESS_VIEWED',
          description: 'Viewed fitness data',
          metadata: { fitnessLevel: fitnessData.fitnessLevel }
        }
      })

      return fitnessData
    }),

  // Get health monitoring data
  getHealthMonitoring: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock health monitoring data
      const monitoringData = {
        activeMetrics: 6,
        vitals: [
          {
            id: 'heart_rate',
            name: 'Heart Rate',
            description: 'Resting heart rate',
            value: 68,
            unit: 'bpm',
            percentage: 85,
            icon: 'Heart'
          },
          {
            id: 'blood_pressure',
            name: 'Blood Pressure',
            description: 'Systolic/Diastolic',
            value: 120,
            unit: '/80 mmHg',
            percentage: 90,
            icon: 'Activity'
          },
          {
            id: 'temperature',
            name: 'Body Temperature',
            description: 'Core body temperature',
            value: 36.8,
            unit: '°C',
            percentage: 95,
            icon: 'Thermometer'
          },
          {
            id: 'weight',
            name: 'Weight',
            description: 'Current body weight',
            value: 70,
            unit: 'kg',
            percentage: 75,
            icon: 'Scale'
          }
        ],
        monitoringAnalytics: [
          {
            id: 'tracking_accuracy',
            name: 'Tracking Accuracy',
            value: '95%',
            percentage: 95
          },
          {
            id: 'data_consistency',
            name: 'Data Consistency',
            value: '88%',
            percentage: 88
          },
          {
            id: 'goal_progress',
            name: 'Goal Progress',
            value: '72%',
            percentage: 72
          },
          {
            id: 'health_score',
            name: 'Health Score',
            value: '85/100',
            percentage: 85
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'HEALTH_MONITORING_VIEWED',
          description: 'Viewed health monitoring data',
          metadata: { activeMetrics: monitoringData.activeMetrics }
        }
      })

      return monitoringData
    }),

  // Get health settings
  getHealthSettings: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock health settings
      const settingsData = {
        healthStreak: 12,
        settings: [
          {
            id: 'health_enabled',
            key: 'healthEnabled',
            name: 'Health Tracking',
            enabled: true,
            icon: 'Activity'
          },
          {
            id: 'notifications',
            key: 'notifications',
            name: 'Health Notifications',
            enabled: true,
            icon: 'Bell'
          },
          {
            id: 'data_sync',
            key: 'dataSync',
            name: 'Data Synchronization',
            enabled: true,
            icon: 'RefreshCw'
          },
          {
            id: 'privacy',
            key: 'privacy',
            name: 'Privacy Mode',
            enabled: false,
            icon: 'Shield'
          }
        ],
        preferences: [
          {
            id: 'goal_weight',
            name: 'Goal Weight',
            value: '68 kg',
            percentage: 85
          },
          {
            id: 'daily_steps',
            name: 'Daily Steps',
            value: '8,500',
            percentage: 70
          },
          {
            id: 'sleep_goal',
            name: 'Sleep Goal',
            value: '8 hours',
            percentage: 90
          },
          {
            id: 'water_intake',
            name: 'Water Intake',
            value: '2.5L',
            percentage: 80
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'HEALTH_SETTINGS_VIEWED',
          description: 'Viewed health settings',
          metadata: { healthStreak: settingsData.healthStreak }
        }
      })

      return settingsData
    }),

  // Start tracking a metric
  startTracking: protectedProcedure
    .input(z.object({
      metricId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'HEALTH_TRACKING_STARTED',
          description: `Started tracking metric: ${input.metricId}`,
          metadata: { metricId: input.metricId }
        }
      })

      return { success: true, message: 'Tracking started successfully' }
    }),

  // Log a workout
  logWorkout: protectedProcedure
    .input(z.object({
      workoutId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'HEALTH_WORKOUT_LOGGED',
          description: `Logged workout: ${input.workoutId}`,
          metadata: { workoutId: input.workoutId }
        }
      })

      return { success: true, message: 'Workout logged successfully' }
    }),

  // Update a metric
  updateMetric: protectedProcedure
    .input(z.object({
      metricId: z.string(),
      value: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'HEALTH_METRIC_UPDATED',
          description: `Updated metric: ${input.metricId}`,
          metadata: { metricId: input.metricId, value: input.value }
        }
      })

      return { success: true, message: 'Metric updated successfully' }
    }),

  // Update health settings
  updateSettings: protectedProcedure
    .input(z.object({
      healthEnabled: z.boolean().optional(),
      notifications: z.boolean().optional(),
      dataSync: z.boolean().optional(),
      privacy: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'HEALTH_SETTINGS_UPDATED',
          description: 'Updated health settings',
          metadata: input
        }
      })

      return { success: true, message: 'Settings updated successfully' }
    }),

  // Get health statistics
  getHealthStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock health statistics
      const stats = {
        totalWorkouts: 45,
        totalCaloriesBurned: 12500,
        averageWellnessScore: 82,
        healthStreak: 12,
        goalsAchieved: 8,
        totalMetricsTracked: 6
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'HEALTH_STATS_VIEWED',
          description: 'Viewed health statistics',
          metadata: stats
        }
      })

      return stats
    })
})
