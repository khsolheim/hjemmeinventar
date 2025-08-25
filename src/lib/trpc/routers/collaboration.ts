import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const collaborationRouter = createTRPCRouter({
  // Get teams
  getTeams: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get teams data
        const activeTeams = 5
        const teams = [
          {
            id: 'team-1',
            name: 'Development Team',
            description: 'Software development team',
            memberCount: 8,
            type: 'project',
            status: 'active'
          },
          {
            id: 'team-2',
            name: 'Design Team',
            description: 'UI/UX design team',
            memberCount: 4,
            type: 'project',
            status: 'active'
          },
          {
            id: 'team-3',
            name: 'Marketing Team',
            description: 'Marketing and sales team',
            memberCount: 6,
            type: 'department',
            status: 'active'
          },
          {
            id: 'team-4',
            name: 'Support Team',
            description: 'Customer support team',
            memberCount: 3,
            type: 'department',
            status: 'active'
          },
          {
            id: 'team-5',
            name: 'Research Team',
            description: 'Research and development team',
            memberCount: 5,
            type: 'project',
            status: 'active'
          }
        ]

        const teamMembers = [
          {
            id: 'member-1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Team Lead',
            status: 'active'
          },
          {
            id: 'member-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'Developer',
            status: 'active'
          },
          {
            id: 'member-3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'Designer',
            status: 'active'
          },
          {
            id: 'member-4',
            name: 'Alice Brown',
            email: 'alice@example.com',
            role: 'Marketing',
            status: 'active'
          },
          {
            id: 'member-5',
            name: 'Charlie Wilson',
            email: 'charlie@example.com',
            role: 'Support',
            status: 'active'
          }
        ]

        return {
          activeTeams,
          teams,
          teamMembers
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente teams'
        })
      }
    }),

  // Get workspaces
  getWorkspaces: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get workspaces data
        const sharedWorkspaces = 8
        const workspaces = [
          {
            id: 'workspace-1',
            name: 'Project Alpha',
            description: 'Main project workspace',
            itemCount: 1247,
            type: 'shared',
            status: 'active'
          },
          {
            id: 'workspace-2',
            name: 'Design Assets',
            description: 'Design and creative assets',
            itemCount: 856,
            type: 'shared',
            status: 'active'
          },
          {
            id: 'workspace-3',
            name: 'Marketing Materials',
            description: 'Marketing and promotional materials',
            itemCount: 432,
            type: 'shared',
            status: 'active'
          },
          {
            id: 'workspace-4',
            name: 'Support Resources',
            description: 'Customer support resources',
            itemCount: 234,
            type: 'shared',
            status: 'active'
          },
          {
            id: 'workspace-5',
            name: 'Research Data',
            description: 'Research and analysis data',
            itemCount: 567,
            type: 'shared',
            status: 'active'
          },
          {
            id: 'workspace-6',
            name: 'Development Tools',
            description: 'Development and testing tools',
            itemCount: 789,
            type: 'shared',
            status: 'active'
          },
          {
            id: 'workspace-7',
            name: 'Documentation',
            description: 'Project documentation',
            itemCount: 345,
            type: 'shared',
            status: 'active'
          },
          {
            id: 'workspace-8',
            name: 'Templates',
            description: 'Reusable templates and components',
            itemCount: 123,
            type: 'shared',
            status: 'active'
          }
        ]

        const workspaceAnalytics = [
          {
            id: 'analytics-1',
            name: 'Active Users',
            value: '24',
            icon: 'Users'
          },
          {
            id: 'analytics-2',
            name: 'Shared Items',
            value: '4,592',
            icon: 'Share2'
          },
          {
            id: 'analytics-3',
            name: 'Collaboration Score',
            value: '94%',
            icon: 'BarChart3'
          },
          {
            id: 'analytics-4',
            name: 'Workspace Usage',
            value: '89%',
            icon: 'Activity'
          }
        ]

        return {
          sharedWorkspaces,
          workspaces,
          workspaceAnalytics
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente workspaces'
        })
      }
    }),

  // Get chat status
  getChatStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get chat data
        const onlineUsers = 12
        const chatChannels = [
          {
            id: 'channel-1',
            name: 'General',
            description: 'General team discussion',
            memberCount: 24,
            lastMessage: '2 min ago',
            isActive: true
          },
          {
            id: 'channel-2',
            name: 'Development',
            description: 'Development team chat',
            memberCount: 8,
            lastMessage: '5 min ago',
            isActive: true
          },
          {
            id: 'channel-3',
            name: 'Design',
            description: 'Design team chat',
            memberCount: 4,
            lastMessage: '10 min ago',
            isActive: true
          },
          {
            id: 'channel-4',
            name: 'Marketing',
            description: 'Marketing team chat',
            memberCount: 6,
            lastMessage: '15 min ago',
            isActive: true
          },
          {
            id: 'channel-5',
            name: 'Support',
            description: 'Support team chat',
            memberCount: 3,
            lastMessage: '20 min ago',
            isActive: true
          }
        ]

        const chatAnalytics = [
          {
            id: 'chat-1',
            name: 'Message Volume',
            value: '1,247',
            percentage: 85
          },
          {
            id: 'chat-2',
            name: 'Response Time',
            value: '2.3 min',
            percentage: 92
          },
          {
            id: 'chat-3',
            name: 'Engagement Rate',
            value: '78%',
            percentage: 78
          },
          {
            id: 'chat-4',
            name: 'Active Channels',
            value: '5',
            percentage: 100
          },
          {
            id: 'chat-5',
            name: 'User Satisfaction',
            value: '4.8/5',
            percentage: 96
          }
        ]

        return {
          onlineUsers,
          chatChannels,
          chatAnalytics
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente chat status'
        })
      }
    }),

  // Get collaboration settings
  getCollaborationSettings: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get collaboration settings
        const collaborationScore = 94
        const settings = [
          {
            id: 'collaboration-enabled',
            key: 'collaborationEnabled',
            name: 'Team Collaboration',
            enabled: true,
            icon: 'Users'
          },
          {
            id: 'workspace-sharing',
            key: 'workspaceSharing',
            name: 'Workspace Sharing',
            enabled: true,
            icon: 'Folder'
          },
          {
            id: 'real-time-chat',
            key: 'realTimeChat',
            name: 'Real-time Chat',
            enabled: true,
            icon: 'MessageSquare'
          },
          {
            id: 'file-sharing',
            key: 'fileSharing',
            name: 'File Sharing',
            enabled: true,
            icon: 'Share2'
          },
          {
            id: 'activity-tracking',
            key: 'activityTracking',
            name: 'Activity Tracking',
            enabled: true,
            icon: 'Activity'
          },
          {
            id: 'notifications',
            key: 'notifications',
            name: 'Collaboration Notifications',
            enabled: true,
            icon: 'Bell'
          }
        ]

        const preferences = [
          {
            id: 'team-size',
            name: 'Team Size',
            value: '8 members',
            percentage: 85
          },
          {
            id: 'workspace-usage',
            name: 'Workspace Usage',
            value: '89%',
            percentage: 89
          },
          {
            id: 'chat-activity',
            name: 'Chat Activity',
            value: 'High',
            percentage: 92
          },
          {
            id: 'collaboration-frequency',
            name: 'Collaboration Frequency',
            value: 'Daily',
            percentage: 78
          }
        ]

        return {
          collaborationScore,
          settings,
          preferences
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente collaboration settings'
        })
      }
    }),

  // Invite user
  inviteUser: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      email: z.string().email(),
      role: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        const { teamId, email, role } = input

        // Invite user
        const result = {
          success: true,
          invitationId: `inv_${Date.now()}`,
          teamId,
          email,
          role,
          status: 'Pending',
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'USER_INVITED',
            description: 'User invited to team',
            userId,
            metadata: {
              invitationId: result.invitationId,
              teamId: result.teamId,
              email: result.email,
              role: result.role,
              status: result.status
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke invitere bruker'
        })
      }
    }),

  // Create team
  createTeam: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      type: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        const { name, description, type } = input

        // Create team
        const result = {
          success: true,
          teamId: `team_${Date.now()}`,
          name,
          description,
          type,
          status: 'Active',
          memberCount: 1,
          timestamp: new Date(),
          createdBy: userId
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'TEAM_CREATED',
            description: 'Team created',
            userId,
            metadata: {
              teamId: result.teamId,
              name: result.name,
              description: result.description,
              type: result.type,
              status: result.status
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette team'
        })
      }
    }),

  // Create workspace
  createWorkspace: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      type: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        const { name, description, type } = input

        // Create workspace
        const result = {
          success: true,
          workspaceId: `workspace_${Date.now()}`,
          name,
          description,
          type,
          status: 'Active',
          itemCount: 0,
          timestamp: new Date(),
          createdBy: userId
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'WORKSPACE_CREATED',
            description: 'Workspace created',
            userId,
            metadata: {
              workspaceId: result.workspaceId,
              name: result.name,
              description: result.description,
              type: result.type,
              status: result.status
            }
          }
        })

        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette workspace'
        })
      }
    }),

  // Update collaboration settings
  updateSettings: protectedProcedure
    .input(z.object({
      collaborationEnabled: z.boolean().optional(),
      workspaceSharing: z.boolean().optional(),
      realTimeChat: z.boolean().optional(),
      fileSharing: z.boolean().optional(),
      activityTracking: z.boolean().optional(),
      notifications: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Update collaboration settings
        const result = {
          success: true,
          updatedSettings: input,
          timestamp: new Date()
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'COLLABORATION_SETTINGS_UPDATED',
            description: 'Collaboration settings updated',
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
          message: 'Kunne ikke oppdatere collaboration settings'
        })
      }
    }),

  // Get collaboration statistics
  getCollaborationStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get collaboration statistics
        const [teams, workspaces, invitations, activities] = await Promise.all([
          ctx.db.activity.count({
            where: {
              userId,
              type: 'TEAM_CREATED'
            }
          }),
          ctx.db.activity.count({
            where: {
              userId,
              type: 'WORKSPACE_CREATED'
            }
          }),
          ctx.db.activity.count({
            where: {
              userId,
              type: 'USER_INVITED'
            }
          }),
          ctx.db.activity.count({
            where: {
              userId,
              type: 'COLLABORATION_SETTINGS_UPDATED'
            }
          })
        ])

        return {
          totalTeams: teams,
          totalWorkspaces: workspaces,
          totalInvitations: invitations,
          totalSettingsUpdates: activities
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente collaboration statistikk'
        })
      }
    })
})
