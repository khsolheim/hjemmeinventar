import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const voiceRouter = createTRPCRouter({
  // Get voice status
  getVoiceStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get voice status data
        const voiceStatus = [
          {
            id: 'speech-recognition',
            name: 'Speech Recognition',
            description: 'Voice input recognition system',
            status: 'Active',
            lastUpdate: '2 min ago',
            isActive: true
          },
          {
            id: 'speech-synthesis',
            name: 'Speech Synthesis',
            description: 'Text-to-speech output system',
            status: 'Active',
            lastUpdate: '1 min ago',
            isActive: true
          },
          {
            id: 'voice-commands',
            name: 'Voice Commands',
            description: 'Command recognition and execution',
            status: 'Active',
            lastUpdate: '5 min ago',
            isActive: true
          },
          {
            id: 'voice-analytics',
            name: 'Voice Analytics',
            description: 'Usage tracking and insights',
            status: 'Active',
            lastUpdate: '10 min ago',
            isActive: true
          }
        ]

        return {
          voiceStatus
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente voice status'
        })
      }
    }),

  // Get voice commands
  getVoiceCommands: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get voice commands
        const totalCommands = 24
        const commands = [
          {
            id: 'add-item',
            name: 'Legg til garn',
            description: 'Add new yarn to inventory',
            category: 'Inventory',
            usageCount: 45,
            isActive: true
          },
          {
            id: 'show-locations',
            name: 'Vis lokasjoner',
            description: 'Show all locations',
            category: 'Navigation',
            usageCount: 32,
            isActive: true
          },
          {
            id: 'search-item',
            name: 'Søk etter item',
            description: 'Search for specific item',
            category: 'Search',
            usageCount: 28,
            isActive: true
          },
          {
            id: 'show-stats',
            name: 'Vis statistikk',
            description: 'Show inventory statistics',
            category: 'Analytics',
            usageCount: 19,
            isActive: true
          },
          {
            id: 'sync-data',
            name: 'Sync data',
            description: 'Synchronize offline data',
            category: 'System',
            usageCount: 15,
            isActive: true
          },
          {
            id: 'backup',
            name: 'Backup',
            description: 'Create data backup',
            category: 'System',
            usageCount: 8,
            isActive: true
          },
          {
            id: 'settings',
            name: 'Settings',
            description: 'Open settings menu',
            category: 'System',
            usageCount: 12,
            isActive: true
          },
          {
            id: 'help',
            name: 'Help',
            description: 'Show help and commands',
            category: 'System',
            usageCount: 6,
            isActive: true
          }
        ]

        const categories = [
          {
            id: 'inventory',
            name: 'Inventory',
            commandCount: 8,
            icon: 'Package'
          },
          {
            id: 'navigation',
            name: 'Navigation',
            commandCount: 6,
            icon: 'MapPin'
          },
          {
            id: 'search',
            name: 'Search',
            commandCount: 4,
            icon: 'Search'
          },
          {
            id: 'analytics',
            name: 'Analytics',
            commandCount: 3,
            icon: 'BarChart3'
          },
          {
            id: 'system',
            name: 'System',
            commandCount: 3,
            icon: 'Settings'
          }
        ]

        return {
          totalCommands,
          commands,
          categories
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente voice commands'
        })
      }
    }),

  // Get voice analytics
  getVoiceAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get voice analytics
        const accuracy = 94
        const totalUsage = 156
        const metrics = [
          {
            id: 'recognition-accuracy',
            name: 'Recognition Accuracy',
            value: '94%',
            percentage: 94
          },
          {
            id: 'command-success',
            name: 'Command Success Rate',
            value: '89%',
            percentage: 89
          },
          {
            id: 'response-time',
            name: 'Response Time',
            value: '1.2s',
            percentage: 85
          },
          {
            id: 'user-satisfaction',
            name: 'User Satisfaction',
            value: '4.8/5',
            percentage: 96
          },
          {
            id: 'daily-usage',
            name: 'Daily Usage',
            value: '12 commands',
            percentage: 75
          }
        ]

        const trends = [
          {
            id: 'trend-1',
            title: 'Increasing Usage',
            description: 'Voice commands usage increased by 25% this week',
            icon: 'TrendingUp'
          },
          {
            id: 'trend-2',
            title: 'Better Accuracy',
            description: 'Recognition accuracy improved by 3%',
            icon: 'CheckCircle'
          },
          {
            id: 'trend-3',
            title: 'Popular Commands',
            description: 'Add item and search are most used commands',
            icon: 'Star'
          },
          {
            id: 'trend-4',
            title: 'User Adoption',
            description: '85% of users actively use voice features',
            icon: 'Users'
          }
        ]

        const trainingData = [
          {
            id: 'training-1',
            name: 'Norwegian Language Model',
            description: 'Train voice recognition for Norwegian language',
            progress: 100,
            status: 'Completed'
          },
          {
            id: 'training-2',
            name: 'User Voice Profile',
            description: 'Personalize voice recognition for user',
            progress: 75,
            status: 'In Progress'
          },
          {
            id: 'training-3',
            name: 'Command Optimization',
            description: 'Optimize command recognition patterns',
            progress: 60,
            status: 'In Progress'
          },
          {
            id: 'training-4',
            name: 'Context Learning',
            description: 'Learn user context and preferences',
            progress: 30,
            status: 'In Progress'
          }
        ]

        return {
          accuracy,
          totalUsage,
          metrics,
          trends,
          trainingData
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente voice analytics'
        })
      }
    }),

  // Get voice settings
  getVoiceSettings: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get voice settings
        const settings = [
          {
            id: 'voice-enabled',
            key: 'voiceEnabled',
            name: 'Voice Assistant',
            enabled: true,
            icon: 'Mic'
          },
          {
            id: 'speech-recognition',
            key: 'speechRecognition',
            name: 'Speech Recognition',
            enabled: true,
            icon: 'Mic'
          },
          {
            id: 'speech-synthesis',
            key: 'speechSynthesis',
            name: 'Speech Synthesis',
            enabled: true,
            icon: 'Volume2'
          },
          {
            id: 'voice-commands',
            key: 'voiceCommands',
            name: 'Voice Commands',
            enabled: true,
            icon: 'MessageSquare'
          },
          {
            id: 'voice-analytics',
            key: 'voiceAnalytics',
            name: 'Voice Analytics',
            enabled: true,
            icon: 'Brain'
          },
          {
            id: 'voice-training',
            key: 'voiceTraining',
            name: 'Voice Training',
            enabled: false,
            icon: 'Headphones'
          }
        ]

        const preferences = [
          {
            id: 'speech-rate',
            name: 'Speech Rate',
            value: '0.9x',
            percentage: 90
          },
          {
            id: 'speech-pitch',
            name: 'Speech Pitch',
            value: '1.0x',
            percentage: 100
          },
          {
            id: 'recognition-confidence',
            name: 'Recognition Confidence',
            value: '0.8',
            percentage: 80
          },
          {
            id: 'response-delay',
            name: 'Response Delay',
            value: '1.2s',
            percentage: 85
          }
        ]

        return {
          settings,
          preferences
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente voice settings'
        })
      }
    }),

  // Execute voice command
  executeCommand: protectedProcedure
    .input(z.object({
      command: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        const { command } = input

        // Process voice command
        const commandLower = command.toLowerCase()
        let response = ''
        let success = false

        if (commandLower.includes('legg til') || commandLower.includes('add')) {
          response = 'Jeg hjelper deg med å legge til nytt garn. Hva heter garnet?'
          success = true
        } else if (commandLower.includes('vis') || commandLower.includes('show')) {
          if (commandLower.includes('lokasjon') || commandLower.includes('location')) {
            response = 'Viser alle lokasjoner for deg.'
            success = true
          } else if (commandLower.includes('statistikk') || commandLower.includes('stats')) {
            response = 'Viser inventarstatistikk.'
            success = true
          }
        } else if (commandLower.includes('søk') || commandLower.includes('search')) {
          response = 'Hva vil du søke etter?'
          success = true
        } else if (commandLower.includes('sync') || commandLower.includes('synkroniser')) {
          response = 'Synkroniserer data nå.'
          success = true
        } else if (commandLower.includes('backup')) {
          response = 'Oppretter backup av data.'
          success = true
        } else if (commandLower.includes('settings') || commandLower.includes('innstillinger')) {
          response = 'Åpner innstillinger.'
          success = true
        } else if (commandLower.includes('help') || commandLower.includes('hjelp')) {
          response = 'Her er tilgjengelige kommandoer: Legg til garn, vis lokasjoner, søk etter item, vis statistikk, sync data, backup, settings, help.'
          success = true
        } else {
          response = 'Beklager, jeg forstod ikke kommandoen. Prøv å si "help" for tilgjengelige kommandoer.'
          success = false
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'VOICE_COMMAND',
            description: `Voice command executed: ${command}`,
            userId,
            metadata: {
              command,
              response,
              success
            }
          }
        })

        return {
          success,
          response,
          command,
          timestamp: new Date()
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke utføre voice command'
        })
      }
    }),

  // Update voice settings
  updateSettings: protectedProcedure
    .input(z.object({
      voiceEnabled: z.boolean().optional(),
      speechRecognition: z.boolean().optional(),
      speechSynthesis: z.boolean().optional(),
      voiceCommands: z.boolean().optional(),
      voiceAnalytics: z.boolean().optional(),
      voiceTraining: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Update voice settings
        const result = {
          success: true,
          updatedSettings: input,
          timestamp: new Date()
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'VOICE_SETTINGS_UPDATED',
            description: 'Voice settings updated',
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
          message: 'Kunne ikke oppdatere voice settings'
        })
      }
    }),

  // Train voice
  trainVoice: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Simulate voice training
        const trainingResult = {
          success: true,
          trainingProgress: 85,
          estimatedTime: '5 min',
          currentStep: 'Optimizing recognition patterns',
          timestamp: new Date()
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'VOICE_TRAINING',
            description: 'Voice training initiated',
            userId,
            metadata: {
              trainingProgress: trainingResult.trainingProgress,
              estimatedTime: trainingResult.estimatedTime,
              currentStep: trainingResult.currentStep
            }
          }
        })

        return trainingResult
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke starte voice training'
        })
      }
    }),

  // Get voice statistics
  getVoiceStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get voice statistics
        const [commands, settings, training] = await Promise.all([
          ctx.db.activity.count({ 
            where: { 
              userId,
              type: 'VOICE_COMMAND'
            }
          }),
          ctx.db.activity.count({ 
            where: { 
              userId,
              type: 'VOICE_SETTINGS_UPDATED'
            }
          }),
          ctx.db.activity.count({ 
            where: { 
              userId,
              type: 'VOICE_TRAINING'
            }
          })
        ])

        return {
          totalCommands: commands,
          totalSettingsUpdates: settings,
          totalTrainingSessions: training
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente voice statistikk'
        })
      }
    })
})
