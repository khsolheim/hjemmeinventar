import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const collaborationRouter = createTRPCRouter({
  // Get shared items
  getSharedItems: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get items shared with current user
        const sharedItems = await ctx.db.item.findMany({
          where: {
            OR: [
              { userId }, // User's own items
              { sharedWith: { some: { userId } } } // Items shared with user
            ]
          },
          include: {
            location: true,
            sharedWith: {
              include: {
                user: true
              }
            },
            user: true
          }
        })

        return sharedItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          location: item.location,
          sharedBy: item.user,
          sharedAt: item.updatedAt,
          sharedWith: item.sharedWith.map(share => share.user)
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente delte gjenstander'
        })
      }
    }),

  // Get messages
  getMessages: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's household
        const household = await ctx.db.household.findFirst({
          where: {
            members: {
              some: { userId }
            }
          }
        })

        if (!household) {
          return []
        }

        // Get messages for the household
        const messages = await ctx.db.message.findMany({
          where: {
            householdId: household.id
          },
          include: {
            sender: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        })

        return messages.map(message => ({
          id: message.id,
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente meldinger'
        })
      }
    }),

  // Get tasks
  getTasks: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's household
        const household = await ctx.db.household.findFirst({
          where: {
            members: {
              some: { userId }
            }
          }
        })

        if (!household) {
          return []
        }

        // Get tasks for the household
        const tasks = await ctx.db.task.findMany({
          where: {
            householdId: household.id
          },
          include: {
            assignee: true,
            createdBy: true
          },
          orderBy: {
            dueDate: 'asc'
          }
        })

        return tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate,
          assignee: task.assignee,
          createdBy: task.createdBy
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente oppgaver'
        })
      }
    }),

  // Share item
  shareItem: protectedProcedure
    .input(z.object({
      itemId: z.string(),
      memberId: z.string(),
      message: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the item
        const item = await ctx.db.item.findFirst({
          where: {
            id: input.itemId,
            userId
          }
        })

        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Gjenstand ikke funnet'
          })
        }

        // Create share record
        await ctx.db.itemShare.create({
          data: {
            itemId: input.itemId,
            userId: input.memberId,
            sharedBy: userId,
            message: input.message
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'ITEM_SHARED',
            description: `Delte ${item.name} med medlem`,
            userId,
            itemId: input.itemId,
            metadata: {
              sharedWith: input.memberId,
              message: input.message
            }
          }
        })

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke dele gjenstand'
        })
      }
    }),

  // Send message
  sendMessage: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
      householdId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user is member of household
        const membership = await ctx.db.householdMember.findFirst({
          where: {
            userId,
            householdId: input.householdId
          }
        })

        if (!membership) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Ikke medlem av husholdningen'
          })
        }

        // Create message
        const message = await ctx.db.message.create({
          data: {
            content: input.message,
            senderId: userId,
            householdId: input.householdId
          },
          include: {
            sender: true
          }
        })

        return {
          id: message.id,
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke sende melding'
        })
      }
    }),

  // Create task
  createTask: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      assigneeId: z.string(),
      dueDate: z.date().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Get user's household
        const household = await ctx.db.household.findFirst({
          where: {
            members: {
              some: { userId }
            }
          }
        })

        if (!household) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Husholdning ikke funnet'
          })
        }

        // Create task
        const task = await ctx.db.task.create({
          data: {
            title: input.title,
            description: input.description,
            status: 'pending',
            dueDate: input.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
            assigneeId: input.assigneeId,
            createdById: userId,
            householdId: household.id
          },
          include: {
            assignee: true,
            createdBy: true
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'TASK_CREATED',
            description: `Opprettet oppgave: ${input.title}`,
            userId,
            metadata: {
              taskId: task.id,
              assigneeId: input.assigneeId
            }
          }
        })

        return {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate,
          assignee: task.assignee,
          createdBy: task.createdBy
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette oppgave'
        })
      }
    }),

  // Update task status
  updateTaskStatus: protectedProcedure
    .input(z.object({
      taskId: z.string(),
      status: z.enum(['pending', 'in_progress', 'completed'])
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Get task and verify user has access
        const task = await ctx.db.task.findFirst({
          where: {
            id: input.taskId,
            OR: [
              { assigneeId: userId },
              { createdById: userId }
            ]
          }
        })

        if (!task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Oppgave ikke funnet'
          })
        }

        // Update task
        const updatedTask = await ctx.db.task.update({
          where: { id: input.taskId },
          data: { status: input.status },
          include: {
            assignee: true,
            createdBy: true
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'TASK_UPDATED',
            description: `Oppdaterte oppgave: ${task.title} til ${input.status}`,
            userId,
            metadata: {
              taskId: task.id,
              previousStatus: task.status,
              newStatus: input.status
            }
          }
        })

        return {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          dueDate: updatedTask.dueDate,
          assignee: updatedTask.assignee,
          createdBy: updatedTask.createdBy
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere oppgave'
        })
      }
    }),

  // Get household members
  getHouseholdMembers: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's household
        const household = await ctx.db.household.findFirst({
          where: {
            members: {
              some: { userId }
            }
          },
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        })

        if (!household) {
          return []
        }

        return household.members.map(member => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
          joinedAt: member.createdAt,
          isOnline: true // Simplified - would need real-time tracking
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente husholdningsmedlemmer'
        })
      }
    })
})
