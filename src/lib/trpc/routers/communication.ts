import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'

export const communicationRouter = createTRPCRouter({
  // Get messages data
  getMessagesData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock messages data
      const messagesData = {
        totalMessages: 156,
        recentMessages: [
          {
            id: 'msg_1',
            sender: 'Anna Hansen',
            senderId: 'user_1',
            content: 'Hei! Har du sett min blå jakke?',
            time: '14:30',
            date: '2024-01-15',
            status: 'read',
            icon: 'MessageSquare'
          },
          {
            id: 'msg_2',
            sender: 'Ole Johansen',
            senderId: 'user_2',
            content: 'Kan du sende meg inventarlisten?',
            time: '12:15',
            date: '2024-01-15',
            status: 'delivered',
            icon: 'MessageSquare'
          },
          {
            id: 'msg_3',
            sender: 'Maria Olsen',
            senderId: 'user_3',
            content: 'Takk for hjelpen med organiseringen!',
            time: '10:45',
            date: '2024-01-14',
            status: 'read',
            icon: 'MessageSquare'
          },
          {
            id: 'msg_4',
            sender: 'Per Nilsen',
            senderId: 'user_4',
            content: 'Skal vi møtes i morgen?',
            time: '09:20',
            date: '2024-01-14',
            status: 'sent',
            icon: 'MessageSquare'
          }
        ],
        messageAnalytics: [
          {
            id: 'messages_sent',
            name: 'Messages Sent',
            value: '89',
            icon: 'MessageSquare'
          },
          {
            id: 'messages_received',
            name: 'Messages Received',
            value: '67',
            icon: 'MessageSquare'
          },
          {
            id: 'response_rate',
            name: 'Response Rate',
            value: '94%',
            icon: 'CheckCircle'
          },
          {
            id: 'avg_response_time',
            name: 'Avg Response Time',
            value: '2.3 min',
            icon: 'Clock'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'COMMUNICATION_MESSAGES_VIEWED',
          description: 'Viewed messages data',
          metadata: { totalMessages: messagesData.totalMessages }
        }
      })

      return messagesData
    }),

  // Get calls data
  getCallsData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock calls data
      const callsData = {
        totalCalls: 23,
        recentCalls: [
          {
            id: 'call_1',
            contact: 'Anna Hansen',
            contactId: 'user_1',
            type: 'video',
            duration: '15:30',
            time: '16:45',
            date: '2024-01-15',
            status: 'connected',
            icon: 'Video'
          },
          {
            id: 'call_2',
            contact: 'Ole Johansen',
            contactId: 'user_2',
            type: 'voice',
            duration: '8:15',
            time: '14:20',
            date: '2024-01-15',
            status: 'connected',
            icon: 'Phone'
          },
          {
            id: 'call_3',
            contact: 'Maria Olsen',
            contactId: 'user_3',
            type: 'video',
            duration: '0:00',
            time: '11:30',
            date: '2024-01-14',
            status: 'missed',
            icon: 'Video'
          },
          {
            id: 'call_4',
            contact: 'Per Nilsen',
            contactId: 'user_4',
            type: 'voice',
            duration: '12:45',
            time: '09:15',
            date: '2024-01-14',
            status: 'ended',
            icon: 'Phone'
          }
        ],
        callAnalytics: [
          {
            id: 'call_quality',
            name: 'Call Quality',
            value: 'Excellent',
            percentage: 95
          },
          {
            id: 'connection_stability',
            name: 'Connection Stability',
            value: '98%',
            percentage: 98
          },
          {
            id: 'video_calls',
            name: 'Video Calls',
            value: '12/23',
            percentage: 52
          },
          {
            id: 'avg_call_duration',
            name: 'Avg Call Duration',
            value: '9.2 min',
            percentage: 75
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'COMMUNICATION_CALLS_VIEWED',
          description: 'Viewed calls data',
          metadata: { totalCalls: callsData.totalCalls }
        }
      })

      return callsData
    }),

  // Get files data
  getFilesData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock files data
      const filesData = {
        totalFiles: 45,
        sharedFiles: [
          {
            id: 'file_1',
            name: 'Inventarliste 2024.xlsx',
            size: '2.3 MB',
            type: 'Excel',
            sharedBy: 'Anna Hansen',
            date: '2024-01-15',
            status: 'shared',
            icon: 'FileText'
          },
          {
            id: 'file_2',
            name: 'Hjemmeorganisering.pdf',
            size: '1.8 MB',
            type: 'PDF',
            sharedBy: 'Ole Johansen',
            date: '2024-01-14',
            status: 'shared',
            icon: 'FileText'
          },
          {
            id: 'file_3',
            name: 'Bilder fra opprydding.jpg',
            size: '5.2 MB',
            type: 'Image',
            sharedBy: 'Maria Olsen',
            date: '2024-01-13',
            status: 'shared',
            icon: 'FileText'
          },
          {
            id: 'file_4',
            name: 'Møtereferat.docx',
            size: '0.8 MB',
            type: 'Word',
            sharedBy: 'Per Nilsen',
            date: '2024-01-12',
            status: 'pending',
            icon: 'FileText'
          }
        ],
        fileAnalytics: [
          {
            id: 'files_shared',
            name: 'Files Shared',
            value: '32',
            icon: 'Share2'
          },
          {
            id: 'files_received',
            name: 'Files Received',
            value: '13',
            icon: 'Download'
          },
          {
            id: 'storage_used',
            name: 'Storage Used',
            value: '45.2 GB',
            icon: 'Database'
          },
          {
            id: 'file_types',
            name: 'File Types',
            value: '8 types',
            icon: 'File'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'COMMUNICATION_FILES_VIEWED',
          description: 'Viewed files data',
          metadata: { totalFiles: filesData.totalFiles }
        }
      })

      return filesData
    }),

  // Get communication settings
  getCommunicationSettings: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock communication settings
      const settingsData = {
        onlineContacts: 8,
        settings: [
          {
            id: 'communication_enabled',
            key: 'communicationEnabled',
            name: 'Communication System',
            enabled: true,
            icon: 'MessageSquare'
          },
          {
            id: 'video_calls',
            key: 'videoCalls',
            name: 'Video Calls',
            enabled: true,
            icon: 'Video'
          },
          {
            id: 'file_sharing',
            key: 'fileSharing',
            name: 'File Sharing',
            enabled: true,
            icon: 'FileText'
          },
          {
            id: 'notifications',
            key: 'notifications',
            name: 'Message Notifications',
            enabled: false,
            icon: 'Bell'
          }
        ],
        communicationGoals: [
          {
            id: 'response_time',
            name: 'Response Time',
            current: 85,
            target: 90
          },
          {
            id: 'call_quality',
            name: 'Call Quality',
            current: 92,
            target: 95
          },
          {
            id: 'file_sharing',
            name: 'File Sharing',
            current: 78,
            target: 85
          },
          {
            id: 'communication_score',
            name: 'Communication Score',
            current: 88,
            target: 92
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'COMMUNICATION_SETTINGS_VIEWED',
          description: 'Viewed communication settings',
          metadata: { onlineContacts: settingsData.onlineContacts }
        }
      })

      return settingsData
    }),

  // Send message
  sendMessage: protectedProcedure
    .input(z.object({
      recipientId: z.string(),
      content: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'COMMUNICATION_MESSAGE_SENT',
          description: `Sent message to: ${input.recipientId}`,
          metadata: { recipientId: input.recipientId, content: input.content }
        }
      })

      return { success: true, message: 'Message sent successfully' }
    }),

  // Start call
  startCall: protectedProcedure
    .input(z.object({
      contactId: z.string(),
      callType: z.enum(['video', 'voice'])
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'COMMUNICATION_CALL_STARTED',
          description: `Started ${input.callType} call with: ${input.contactId}`,
          metadata: { contactId: input.contactId, callType: input.callType }
        }
      })

      return { success: true, message: 'Call started successfully' }
    }),

  // Share file
  shareFile: protectedProcedure
    .input(z.object({
      fileId: z.string(),
      recipientId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'COMMUNICATION_FILE_SHARED',
          description: `Shared file: ${input.fileId}`,
          metadata: { fileId: input.fileId, recipientId: input.recipientId }
        }
      })

      return { success: true, message: 'File shared successfully' }
    }),

  // Update communication settings
  updateSettings: protectedProcedure
    .input(z.object({
      communicationEnabled: z.boolean().optional(),
      videoCalls: z.boolean().optional(),
      fileSharing: z.boolean().optional(),
      notifications: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'COMMUNICATION_SETTINGS_UPDATED',
          description: 'Updated communication settings',
          metadata: input
        }
      })

      return { success: true, message: 'Settings updated successfully' }
    }),

  // Get communication statistics
  getCommunicationStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock communication statistics
      const stats = {
        totalMessages: 156,
        totalCalls: 23,
        totalFiles: 45,
        onlineContacts: 8,
        responseRate: 94,
        avgCallDuration: 9.2
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'COMMUNICATION_STATS_VIEWED',
          description: 'Viewed communication statistics',
          metadata: stats
        }
      })

      return stats
    })
})
