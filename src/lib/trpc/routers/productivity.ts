import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'

export const productivityRouter = createTRPCRouter({
  // Get tasks data
  getTasksData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock tasks data
      const tasksData = {
        totalTasks: 12,
        tasks: [
          {
            id: 'task_1',
            title: 'Oppdater inventar',
            description: 'Legg til nye gjenstander og oppdater eksisterende',
            priority: 'High',
            dueDate: '2024-01-20',
            status: 'in_progress',
            icon: 'CheckSquare'
          },
          {
            id: 'task_2',
            title: 'Organiser kjøkken',
            description: 'Rydde opp i kjøkkenskap og organisere utstyr',
            priority: 'Medium',
            dueDate: '2024-01-22',
            status: 'pending',
            icon: 'Home'
          },
          {
            id: 'task_3',
            title: 'Backup av data',
            description: 'Sikkerhetskopiere viktige filer og dokumenter',
            priority: 'High',
            dueDate: '2024-01-18',
            status: 'completed',
            icon: 'Database'
          },
          {
            id: 'task_4',
            title: 'Planlegg ferie',
            description: 'Bok reise og planlegg aktiviteter for sommerferie',
            priority: 'Low',
            dueDate: '2024-02-15',
            status: 'pending',
            icon: 'Calendar'
          }
        ],
        taskAnalytics: [
          {
            id: 'completed_tasks',
            name: 'Completed Tasks',
            value: '8/12',
            icon: 'CheckCircle'
          },
          {
            id: 'overdue_tasks',
            name: 'Overdue Tasks',
            value: '1',
            icon: 'AlertTriangle'
          },
          {
            id: 'productivity_rate',
            name: 'Productivity Rate',
            value: '85%',
            icon: 'TrendingUp'
          },
          {
            id: 'average_completion',
            name: 'Avg Completion Time',
            value: '2.3 days',
            icon: 'Clock'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'PRODUCTIVITY_TASKS_VIEWED',
          description: 'Viewed tasks data',
          metadata: { totalTasks: tasksData.totalTasks }
        }
      })

      return tasksData
    }),

  // Get time tracking data
  getTimeTrackingData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock time tracking data
      const timeData = {
        totalTimeTracked: 32,
        timeEntries: [
          {
            id: 'entry_1',
            taskName: 'Inventar oppdatering',
            projectName: 'Hjemmeorganisering',
            duration: 4.5,
            date: '2024-01-15',
            startTime: '09:00',
            endTime: '13:30',
            status: 'completed',
            icon: 'CheckSquare'
          },
          {
            id: 'entry_2',
            taskName: 'Kjøkken organisering',
            projectName: 'Hjemmeorganisering',
            duration: 2.0,
            date: '2024-01-14',
            startTime: '14:00',
            endTime: '16:00',
            status: 'completed',
            icon: 'Home'
          },
          {
            id: 'entry_3',
            taskName: 'Data backup',
            projectName: 'Sikkerhet',
            duration: 1.5,
            date: '2024-01-13',
            startTime: '10:30',
            endTime: '12:00',
            status: 'completed',
            icon: 'Database'
          },
          {
            id: 'entry_4',
            taskName: 'Ferieplanlegging',
            projectName: 'Personlig',
            duration: 3.0,
            date: '2024-01-12',
            startTime: '15:00',
            endTime: '18:00',
            status: 'in_progress',
            icon: 'Calendar'
          }
        ],
        timeAnalytics: [
          {
            id: 'daily_average',
            name: 'Daily Average',
            value: '6.4 hours',
            percentage: 80
          },
          {
            id: 'project_distribution',
            name: 'Project Distribution',
            value: 'Hjemmeorganisering: 60%, Sikkerhet: 20%, Personlig: 20%',
            percentage: 100
          },
          {
            id: 'productivity_trend',
            name: 'Productivity Trend',
            value: '+15% vs last week',
            percentage: 85
          },
          {
            id: 'focus_time',
            name: 'Focus Time',
            value: '4.2 hours',
            percentage: 70
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'PRODUCTIVITY_TIME_VIEWED',
          description: 'Viewed time tracking data',
          metadata: { totalTimeTracked: timeData.totalTimeTracked }
        }
      })

      return timeData
    }),

  // Get projects data
  getProjectsData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock projects data
      const projectsData = {
        activeProjects: 4,
        projects: [
          {
            id: 'project_1',
            name: 'Hjemmeorganisering',
            description: 'Organisere og rydde opp i hele hjemmet',
            progress: 75,
            deadline: '2024-02-01',
            status: 'active',
            icon: 'Home'
          },
          {
            id: 'project_2',
            name: 'Digital Sikkerhet',
            description: 'Sikre digitale filer og oppsett backup system',
            progress: 90,
            deadline: '2024-01-25',
            status: 'active',
            icon: 'Shield'
          },
          {
            id: 'project_3',
            name: 'Sommerferie Planlegging',
            description: 'Planlegge og booke sommerferie',
            progress: 30,
            deadline: '2024-03-01',
            status: 'active',
            icon: 'Calendar'
          },
          {
            id: 'project_4',
            name: 'Hobby Prosjekt',
            description: 'Starte ny hobby og lære nye ferdigheter',
            progress: 15,
            deadline: '2024-04-01',
            status: 'active',
            icon: 'Target'
          }
        ],
        projectAnalytics: [
          {
            id: 'completion_rate',
            name: 'Completion Rate',
            value: '78%',
            icon: 'CheckCircle'
          },
          {
            id: 'on_schedule',
            name: 'On Schedule',
            value: '3/4',
            icon: 'Clock'
          },
          {
            id: 'team_collaboration',
            name: 'Team Collaboration',
            value: '85%',
            icon: 'Users'
          },
          {
            id: 'resource_utilization',
            name: 'Resource Utilization',
            value: '92%',
            icon: 'BarChart3'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'PRODUCTIVITY_PROJECTS_VIEWED',
          description: 'Viewed projects data',
          metadata: { activeProjects: projectsData.activeProjects }
        }
      })

      return projectsData
    }),

  // Get productivity settings
  getProductivitySettings: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock productivity settings
      const settingsData = {
        productivityScore: 85,
        settings: [
          {
            id: 'productivity_enabled',
            key: 'productivityEnabled',
            name: 'Productivity Tracking',
            enabled: true,
            icon: 'CheckSquare'
          },
          {
            id: 'time_tracking',
            key: 'timeTracking',
            name: 'Time Tracking',
            enabled: true,
            icon: 'Clock'
          },
          {
            id: 'task_reminders',
            key: 'taskReminders',
            name: 'Task Reminders',
            enabled: true,
            icon: 'Bell'
          },
          {
            id: 'focus_mode',
            key: 'focusMode',
            name: 'Focus Mode',
            enabled: false,
            icon: 'Target'
          }
        ],
        productivityGoals: [
          {
            id: 'daily_tasks',
            name: 'Daily Tasks Completion',
            current: 85,
            target: 90
          },
          {
            id: 'focus_time',
            name: 'Daily Focus Time',
            current: 70,
            target: 80
          },
          {
            id: 'project_progress',
            name: 'Project Progress',
            current: 78,
            target: 85
          },
          {
            id: 'productivity_score',
            name: 'Overall Productivity',
            current: 85,
            target: 90
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'PRODUCTIVITY_SETTINGS_VIEWED',
          description: 'Viewed productivity settings',
          metadata: { productivityScore: settingsData.productivityScore }
        }
      })

      return settingsData
    }),

  // Add task
  addTask: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      priority: z.string(),
      dueDate: z.string(),
      projectId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'PRODUCTIVITY_TASK_ADDED',
          description: `Added task: ${input.title}`,
          metadata: { priority: input.priority, dueDate: input.dueDate }
        }
      })

      return { success: true, message: 'Task added successfully' }
    }),

  // Update task
  updateTask: protectedProcedure
    .input(z.object({
      taskId: z.string(),
      status: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'PRODUCTIVITY_TASK_UPDATED',
          description: `Updated task: ${input.taskId}`,
          metadata: { status: input.status }
        }
      })

      return { success: true, message: 'Task updated successfully' }
    }),

  // Start time tracking
  startTimeTracking: protectedProcedure
    .input(z.object({
      taskId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'PRODUCTIVITY_TIME_STARTED',
          description: `Started time tracking for task: ${input.taskId}`,
          metadata: { taskId: input.taskId }
        }
      })

      return { success: true, message: 'Time tracking started successfully' }
    }),

  // Update productivity settings
  updateSettings: protectedProcedure
    .input(z.object({
      productivityEnabled: z.boolean().optional(),
      timeTracking: z.boolean().optional(),
      taskReminders: z.boolean().optional(),
      focusMode: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'PRODUCTIVITY_SETTINGS_UPDATED',
          description: 'Updated productivity settings',
          metadata: input
        }
      })

      return { success: true, message: 'Settings updated successfully' }
    }),

  // Get productivity statistics
  getProductivityStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock productivity statistics
      const stats = {
        totalTasks: 12,
        completedTasks: 8,
        totalTimeTracked: 32,
        activeProjects: 4,
        productivityScore: 85,
        averageCompletionTime: 2.3
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'PRODUCTIVITY_STATS_VIEWED',
          description: 'Viewed productivity statistics',
          metadata: stats
        }
      })

      return stats
    })
})
