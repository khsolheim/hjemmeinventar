import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const mlRouter = createTRPCRouter({
  // Get ML models
  getModels: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's ML models
        const models = await ctx.db.mlModel.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })

        // Calculate active models and average accuracy
        const activeModels = models.filter(model => model.status === 'deployed').length
        const averageAccuracy = models.length > 0 
          ? models.reduce((sum, model) => sum + model.accuracy, 0) / models.length 
          : 0

        return {
          models: models.map(model => ({
            id: model.id,
            name: model.name,
            type: model.type,
            description: model.description,
            status: model.status,
            accuracy: model.accuracy,
            confidence: model.confidence,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt
          })),
          activeModels,
          averageAccuracy: Math.round(averageAccuracy)
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente ML-modeller'
        })
      }
    }),

  // Get training status
  getTrainingStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's training sessions
        const sessions = await ctx.db.mlTrainingSession.findMany({
          where: { userId },
          orderBy: { startedAt: 'desc' },
          take: 10
        })

        return {
          sessions: sessions.map(session => ({
            id: session.id,
            modelName: session.modelName,
            status: session.status,
            progress: session.progress,
            startedAt: session.startedAt,
            completedAt: session.completedAt,
            duration: session.duration,
            finalAccuracy: session.finalAccuracy,
            eta: session.eta
          }))
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente treningsstatus'
        })
      }
    }),

  // Get predictions
  getPredictions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's predictions
        const predictions = await ctx.db.mlPrediction.findMany({
          where: { userId },
          orderBy: { timestamp: 'desc' },
          take: 20
        })

        // Calculate today's predictions
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayPredictions = predictions.filter(prediction => 
          new Date(prediction.timestamp) >= today
        ).length

        return {
          predictions: predictions.map(prediction => ({
            id: prediction.id,
            modelName: prediction.modelName,
            input: prediction.input,
            output: prediction.output,
            confidence: prediction.confidence,
            timestamp: prediction.timestamp
          })),
          todayPredictions
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente prediksjoner'
        })
      }
    }),

  // Get data insights
  getDataInsights: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's data for insights
        const [items, activities, analytics] = await Promise.all([
          ctx.db.item.findMany({ where: { userId } }),
          ctx.db.activity.findMany({ where: { userId } }),
          ctx.db.analytics.findMany({ where: { userId } })
        ])

        // Calculate data quality metrics
        const quality = calculateDataQualityMetrics(items, activities, analytics)

        // Calculate data distribution
        const distribution = calculateDataDistribution(items, activities, analytics)

        // Generate data insights
        const insights = generateDataInsights(items, activities, analytics)

        return {
          totalDataPoints: items.length + activities.length + analytics.length,
          quality,
          distribution,
          insights
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente data-innsikt'
        })
      }
    }),

  // Train model
  trainModel: protectedProcedure
    .input(z.object({
      modelId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the model
        const model = await ctx.db.mlModel.findFirst({
          where: {
            id: input.modelId,
            userId
          }
        })

        if (!model) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ML-modell ikke funnet'
          })
        }

        // Create training session
        const session = await ctx.db.mlTrainingSession.create({
          data: {
            modelId: input.modelId,
            modelName: model.name,
            status: 'training',
            progress: 0,
            startedAt: new Date(),
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'ML_MODEL_TRAINING_STARTED',
            description: `Startet trening av modell: ${model.name}`,
            userId,
            metadata: {
              modelId: model.id,
              modelName: model.name,
              sessionId: session.id
            }
          }
        })

        return session
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke starte modell-trening'
        })
      }
    }),

  // Deploy model
  deployModel: protectedProcedure
    .input(z.object({
      modelId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the model
        const model = await ctx.db.mlModel.findFirst({
          where: {
            id: input.modelId,
            userId
          }
        })

        if (!model) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ML-modell ikke funnet'
          })
        }

        // Update model status
        const updatedModel = await ctx.db.mlModel.update({
          where: { id: input.modelId },
          data: { 
            status: 'deployed',
            updatedAt: new Date()
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'ML_MODEL_DEPLOYED',
            description: `Deployet modell: ${model.name}`,
            userId,
            metadata: {
              modelId: model.id,
              modelName: model.name
            }
          }
        })

        return updatedModel
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke deploye modell'
        })
      }
    }),

  // Generate prediction
  generatePrediction: protectedProcedure
    .input(z.object({
      modelId: z.string(),
      data: z.any()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the model
        const model = await ctx.db.mlModel.findFirst({
          where: {
            id: input.modelId,
            userId
          }
        })

        if (!model) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ML-modell ikke funnet'
          })
        }

        // Generate prediction (simulate)
        const prediction = await generateMLPrediction(model, input.data)

        // Save prediction
        const savedPrediction = await ctx.db.mlPrediction.create({
          data: {
            modelId: input.modelId,
            modelName: model.name,
            input: JSON.stringify(input.data),
            output: JSON.stringify(prediction.output),
            confidence: prediction.confidence,
            timestamp: new Date(),
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'ML_PREDICTION_GENERATED',
            description: `Genererte prediksjon med ${model.name}`,
            userId,
            metadata: {
              modelId: model.id,
              modelName: model.name,
              predictionId: savedPrediction.id,
              confidence: prediction.confidence
            }
          }
        })

        return savedPrediction
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke generere prediksjon'
        })
      }
    }),

  // Create new model
  createModel: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(['classification', 'regression', 'clustering', 'recommendation']),
      description: z.string(),
      parameters: z.any()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        const model = await ctx.db.mlModel.create({
          data: {
            name: input.name,
            type: input.type,
            description: input.description,
            parameters: input.parameters,
            status: 'created',
            accuracy: 0,
            confidence: 0,
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'ML_MODEL_CREATED',
            description: `Opprettet ny ML-modell: ${input.name}`,
            userId,
            metadata: {
              modelId: model.id,
              modelName: input.name,
              modelType: input.type
            }
          }
        })

        return model
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette modell'
        })
      }
    }),

  // Get ML statistics
  getMLStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get ML statistics
        const [models, predictions, sessions] = await Promise.all([
          ctx.db.mlModel.count({ where: { userId } }),
          ctx.db.mlPrediction.count({ where: { userId } }),
          ctx.db.mlTrainingSession.count({ where: { userId } })
        ])

        // Get deployed models
        const deployedModels = await ctx.db.mlModel.count({
          where: {
            userId,
            status: 'deployed'
          }
        })

        // Calculate ML score
        const mlScore = calculateMLScore(models, predictions, sessions, deployedModels)

        return {
          totalModels: models,
          totalPredictions: predictions,
          totalSessions: sessions,
          deployedModels,
          mlScore
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente ML-statistikk'
        })
      }
    }),

  // Get models data
  getModelsData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock models data
      const modelsData = {
        activeModels: 6,
        models: [
          {
            id: 'model_1',
            name: 'Inventory Prediction Model',
            description: 'Predict inventory needs and trends',
            accuracy: 94,
            version: 'v2.1.0',
            lastUpdated: '2 hours ago',
            status: 'deployed',
            icon: 'MLModel'
          },
          {
            id: 'model_2',
            name: 'Item Classification Model',
            description: 'Automatically classify inventory items',
            accuracy: 89,
            version: 'v1.8.2',
            lastUpdated: '1 day ago',
            status: 'deployed',
            icon: 'MLModel'
          },
          {
            id: 'model_3',
            name: 'Demand Forecasting Model',
            description: 'Forecast future demand patterns',
            accuracy: 87,
            version: 'v1.5.1',
            lastUpdated: '3 days ago',
            status: 'training',
            icon: 'MLModel'
          },
          {
            id: 'model_4',
            name: 'Anomaly Detection Model',
            description: 'Detect unusual inventory patterns',
            accuracy: 92,
            version: 'v1.2.0',
            lastUpdated: '1 week ago',
            status: 'draft',
            icon: 'MLModel'
          }
        ],
        modelAnalytics: [
          {
            id: 'model_accuracy',
            name: 'Avg Model Accuracy',
            value: '90.5%',
            icon: 'Target'
          },
          {
            id: 'predictions_made',
            name: 'Predictions Made',
            value: '1,234',
            icon: 'MLAnalytics'
          },
          {
            id: 'model_versions',
            name: 'Model Versions',
            value: '4',
            icon: 'MLModel'
          },
          {
            id: 'training_time',
            name: 'Avg Training Time',
            value: '2.3h',
            icon: 'Timer'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'ML_MODELS_VIEWED',
          description: 'Viewed ML models data',
          metadata: { activeModels: modelsData.activeModels }
        }
      })

      return modelsData
    }),

  // Get analytics data
  getAnalyticsData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock analytics data
      const analyticsData = {
        totalPredictions: 1234,
        analytics: [
          {
            id: 'analytic_1',
            name: 'Inventory Trend Analysis',
            description: 'Analyze inventory trends over time',
            type: 'Time Series',
            lastRun: '1 hour ago',
            duration: '15 min',
            status: 'completed',
            icon: 'MLAnalytics'
          },
          {
            id: 'analytic_2',
            name: 'Demand Pattern Recognition',
            description: 'Identify demand patterns and cycles',
            type: 'Pattern Recognition',
            lastRun: '3 hours ago',
            duration: '25 min',
            status: 'completed',
            icon: 'MLAnalytics'
          },
          {
            id: 'analytic_3',
            name: 'Cost Optimization Analysis',
            description: 'Optimize inventory costs and efficiency',
            type: 'Optimization',
            lastRun: '6 hours ago',
            duration: '30 min',
            status: 'completed',
            icon: 'MLAnalytics'
          },
          {
            id: 'analytic_4',
            name: 'Risk Assessment Model',
            description: 'Assess inventory risks and vulnerabilities',
            type: 'Risk Analysis',
            lastRun: '12 hours ago',
            duration: '20 min',
            status: 'running',
            icon: 'MLAnalytics'
          }
        ],
        analyticsResults: [
          {
            id: 'prediction_accuracy',
            name: 'Prediction Accuracy',
            value: '94%',
            percentage: 94
          },
          {
            id: 'data_quality',
            name: 'Data Quality',
            value: '96%',
            percentage: 96
          },
          {
            id: 'processing_speed',
            name: 'Processing Speed',
            value: '2.3s',
            percentage: 85
          },
          {
            id: 'model_performance',
            name: 'Model Performance',
            value: '91%',
            percentage: 91
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'ML_ANALYTICS_VIEWED',
          description: 'Viewed ML analytics data',
          metadata: { totalPredictions: analyticsData.totalPredictions }
        }
      })

      return analyticsData
    }),

  // Get training data
  getTrainingData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock training data
      const trainingData = {
        activeJobs: 3,
        trainingJobs: [
          {
            id: 'job_1',
            name: 'Inventory Prediction Model Training',
            description: 'Training new prediction model',
            progress: 75,
            eta: '2 hours',
            dataset: 'Inventory Dataset v3',
            status: 'running',
            icon: 'MLWorkflow'
          },
          {
            id: 'job_2',
            name: 'Classification Model Update',
            description: 'Updating classification model',
            progress: 45,
            eta: '4 hours',
            dataset: 'Item Classification v2',
            status: 'running',
            icon: 'MLWorkflow'
          },
          {
            id: 'job_3',
            name: 'Anomaly Detection Training',
            description: 'Training anomaly detection model',
            progress: 90,
            eta: '30 min',
            dataset: 'Anomaly Dataset v1',
            status: 'running',
            icon: 'MLWorkflow'
          },
          {
            id: 'job_4',
            name: 'Demand Forecasting Update',
            description: 'Updating demand forecasting model',
            progress: 0,
            eta: '6 hours',
            dataset: 'Demand Dataset v4',
            status: 'queued',
            icon: 'MLWorkflow'
          }
        ],
        trainingAnalytics: [
          {
            id: 'training_jobs',
            name: 'Active Jobs',
            value: '3',
            icon: 'MLWorkflow'
          },
          {
            id: 'avg_training_time',
            name: 'Avg Training Time',
            value: '4.2h',
            icon: 'Timer'
          },
          {
            id: 'success_rate',
            name: 'Success Rate',
            value: '92%',
            icon: 'CheckCircle'
          },
          {
            id: 'gpu_utilization',
            name: 'GPU Utilization',
            value: '78%',
            icon: 'Cpu'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'ML_TRAINING_VIEWED',
          description: 'Viewed ML training data',
          metadata: { activeJobs: trainingData.activeJobs }
        }
      })

      return trainingData
    }),

  // Get ML settings
  getMLSettings: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock ML settings
      const settingsData = {
        mlScore: 91,
        settings: [
          {
            id: 'ml_enabled',
            key: 'mlEnabled',
            name: 'Machine Learning System',
            enabled: true,
            icon: 'MLSystem'
          },
          {
            id: 'auto_training',
            key: 'autoTraining',
            name: 'Auto Training',
            enabled: true,
            icon: 'MLWorkflow'
          },
          {
            id: 'predictive_analytics',
            key: 'predictiveAnalytics',
            name: 'Predictive Analytics',
            enabled: true,
            icon: 'MLAnalytics'
          },
          {
            id: 'model_monitoring',
            key: 'modelMonitoring',
            name: 'Model Monitoring',
            enabled: false,
            icon: 'MLModel'
          }
        ],
        mlGoals: [
          {
            id: 'model_accuracy',
            name: 'Model Accuracy',
            current: 91,
            target: 95
          },
          {
            id: 'training_efficiency',
            name: 'Training Efficiency',
            current: 85,
            target: 90
          },
          {
            id: 'prediction_speed',
            name: 'Prediction Speed',
            current: 88,
            target: 92
          },
          {
            id: 'data_quality',
            name: 'Data Quality',
            current: 94,
            target: 98
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'ML_SETTINGS_VIEWED',
          description: 'Viewed ML settings',
          metadata: { mlScore: settingsData.mlScore }
        }
      })

      return settingsData
    }),

  // Deploy model
  deployModel: protectedProcedure
    .input(z.object({
      modelId: z.string(),
      action: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'ML_MODEL_DEPLOYED',
          description: `Deployed model: ${input.modelId}`,
          metadata: { modelId: input.modelId, action: input.action }
        }
      })

      return { success: true, message: 'Model deployed successfully' }
    }),

  // Run analytics
  runAnalytics: protectedProcedure
    .input(z.object({
      analyticId: z.string(),
      action: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'ML_ANALYTICS_RUN',
          description: `Ran analytics: ${input.analyticId}`,
          metadata: { analyticId: input.analyticId, action: input.action }
        }
      })

      return { success: true, message: 'Analytics run successfully' }
    }),

  // Start training
  startTraining: protectedProcedure
    .input(z.object({
      jobId: z.string(),
      action: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'ML_TRAINING_STARTED',
          description: `Started training: ${input.jobId}`,
          metadata: { jobId: input.jobId, action: input.action }
        }
      })

      return { success: true, message: 'Training started successfully' }
    }),

  // Update ML settings
  updateSettings: protectedProcedure
    .input(z.object({
      mlEnabled: z.boolean().optional(),
      autoTraining: z.boolean().optional(),
      predictiveAnalytics: z.boolean().optional(),
      modelMonitoring: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'ML_SETTINGS_UPDATED',
          description: 'Updated ML settings',
          metadata: input
        }
      })

      return { success: true, message: 'ML settings updated successfully' }
    }),

  // Get ML statistics
  getMLStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock ML statistics
      const stats = {
        activeModels: 6,
        totalPredictions: 1234,
        activeJobs: 3,
        mlScore: 91,
        avgAccuracy: 90.5,
        trainingSuccessRate: 92
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'ML_STATS_VIEWED',
          description: 'Viewed ML statistics',
          metadata: stats
        }
      })

      return stats
    })
})

// Helper functions
function calculateDataQualityMetrics(items: any[], activities: any[], analytics: any[]): any[] {
  return [
    {
      name: 'Completeness',
      value: 85,
      percentage: 85
    },
    {
      name: 'Accuracy',
      value: 92,
      percentage: 92
    },
    {
      name: 'Consistency',
      value: 78,
      percentage: 78
    },
    {
      name: 'Timeliness',
      value: 95,
      percentage: 95
    }
  ]
}

function calculateDataDistribution(items: any[], activities: any[], analytics: any[]): any[] {
  return [
    {
      name: 'Items',
      count: items.length,
      percentage: (items.length / (items.length + activities.length + analytics.length)) * 100
    },
    {
      name: 'Activities',
      count: activities.length,
      percentage: (activities.length / (items.length + activities.length + analytics.length)) * 100
    },
    {
      name: 'Analytics',
      count: analytics.length,
      percentage: (analytics.length / (items.length + activities.length + analytics.length)) * 100
    }
  ]
}

function generateDataInsights(items: any[], activities: any[], analytics: any[]): any[] {
  const insights = []

  // Data volume insights
  const totalDataPoints = items.length + activities.length + analytics.length
  if (totalDataPoints < 100) {
    insights.push({
      id: 'insight-1',
      title: 'Lav datamengde',
      description: 'Du har lite data for ML-trening. Legg til mer data for bedre resultater.',
      severity: 'high'
    })
  }

  // Data quality insights
  const itemsWithCompleteData = items.filter(item => 
    item.name && item.categoryId && item.locationId
  ).length
  const dataQualityPercentage = (itemsWithCompleteData / items.length) * 100

  if (dataQualityPercentage < 80) {
    insights.push({
      id: 'insight-2',
      title: 'Dårlig datakvalitet',
      description: `${Math.round(100 - dataQualityPercentage)}% av data mangler viktige felter.`,
      severity: 'medium'
    })
  }

  // Activity patterns insights
  const recentActivities = activities.slice(0, 50)
  const activityTypes = recentActivities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostCommonActivity = Object.entries(activityTypes)
    .sort(([,a], [,b]) => b - a)[0]

  if (mostCommonActivity && mostCommonActivity[1] > recentActivities.length * 0.5) {
    insights.push({
      id: 'insight-3',
      title: 'Ubalansert aktivitet',
      description: `${mostCommonActivity[0]} dominerer aktivitetsdata. Varier aktivitetene for bedre ML-modeller.`,
      severity: 'low'
    })
  }

  return insights
}

async function generateMLPrediction(model: any, data: any): Promise<any> {
  // Simulate ML prediction
  const predictions = {
    classification: {
      output: { class: 'positive', probability: 0.87 },
      confidence: 87
    },
    regression: {
      output: { value: 42.5, range: [38, 47] },
      confidence: 92
    },
    clustering: {
      output: { cluster: 2, distance: 0.15 },
      confidence: 85
    },
    recommendation: {
      output: { items: ['item1', 'item2', 'item3'], scores: [0.95, 0.87, 0.76] },
      confidence: 89
    }
  }

  const prediction = predictions[model.type] || predictions.classification
  
  // Add some randomness to make it more realistic
  const confidenceVariation = Math.random() * 10 - 5
  prediction.confidence = Math.max(50, Math.min(100, prediction.confidence + confidenceVariation))

  return prediction
}

function calculateMLScore(models: number, predictions: number, sessions: number, deployedModels: number): number {
  let score = 0

  // Models (max 25 points)
  score += Math.min(models * 5, 25)

  // Predictions (max 25 points)
  score += Math.min(predictions / 10, 25)

  // Training sessions (max 20 points)
  score += Math.min(sessions * 2, 20)

  // Deployed models (max 30 points)
  score += Math.min(deployedModels * 10, 30)

  return Math.max(0, Math.min(100, score))
}
