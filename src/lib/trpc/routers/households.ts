import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { logActivity } from '../../db'
import { HouseholdRole } from '@prisma/client'

export const householdsRouter = createTRPCRouter({
  // Get user's households
  getMyHouseholds: protectedProcedure
    .query(async ({ ctx }) => {
      const households = await ctx.db.householdMember.findMany({
        where: { userId: ctx.user.id },
        include: {
          household: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { joinedAt: 'desc' }
      })

      return households.map(membership => ({
        ...membership.household,
        memberCount: membership.household.members.length,
        myRole: membership.role,
        members: membership.household.members
      }))
    }),

  // Get specific household details
  getHousehold: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Verify user is member of this household
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.user.id,
          householdId: input
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Du har ikke tilgang til denne husholdningen'
        })
      }

      const household = await ctx.db.household.findUnique({
        where: { id: input },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            },
            orderBy: [
              { role: 'asc' }, // ADMIN first
              { joinedAt: 'asc' }
            ]
          }
        }
      })

      if (!household) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Husholdning ikke funnet'
        })
      }

      return {
        ...household,
        myRole: membership.role,
        memberCount: household.members.length
      }
    }),

  // Create new household
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const household = await ctx.db.household.create({
        data: {
          name: input.name,
          description: input.description,
          members: {
            create: {
              userId: ctx.user.id,
              role: 'ADMIN'
            }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          }
        }
      })

      // Log activity
      await logActivity({
        type: 'HOUSEHOLD_CREATED',
        description: `Opprettet husholdning: ${household.name}`,
        userId: ctx.user.id
      })

      return household
    }),

  // Update household
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(50).optional(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify user is admin of this household
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.user.id,
          householdId: id,
          role: 'ADMIN'
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Kun administratorer kan oppdatere husholdningen'
        })
      }

      const household = await ctx.db.household.update({
        where: { id },
        data: updateData,
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          }
        }
      })

      // Log activity
      await logActivity({
        type: 'HOUSEHOLD_UPDATED',
        description: `Oppdaterte husholdning: ${household.name}`,
        userId: ctx.user.id
      })

      return household
    }),

  // Invite user to household
  inviteUser: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      email: z.string().email(),
      role: z.nativeEnum(HouseholdRole).default('MEMBER')
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is admin of this household
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.user.id,
          householdId: input.householdId,
          role: 'ADMIN'
        },
        include: {
          household: true
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Kun administratorer kan invitere brukere'
        })
      }

      // Check if user exists
      const invitedUser = await ctx.db.user.findUnique({
        where: { email: input.email }
      })

      if (!invitedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bruker med denne e-postadressen finnes ikke'
        })
      }

      // Check if user is already a member
      const existingMembership = await ctx.db.householdMember.findFirst({
        where: {
          userId: invitedUser.id,
          householdId: input.householdId
        }
      })

      if (existingMembership) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Brukeren er allerede medlem av denne husholdningen'
        })
      }

      // Add user to household
      const newMembership = await ctx.db.householdMember.create({
        data: {
          userId: invitedUser.id,
          householdId: input.householdId,
          role: input.role
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })

      // Log activity
      await logActivity({
        type: 'HOUSEHOLD_MEMBER_ADDED',
        description: `Inviterte ${invitedUser.email} til ${membership.household.name}`,
        userId: ctx.user.id
      })

      // In a real app, you might send an email notification here
      console.log(`Invitation sent to ${input.email} for household ${membership.household.name}`)

      return newMembership
    }),

  // Update member role
  updateMemberRole: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      memberId: z.string(),
      role: z.nativeEnum(HouseholdRole)
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is admin of this household
      const adminMembership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.user.id,
          householdId: input.householdId,
          role: 'ADMIN'
        }
      })

      if (!adminMembership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Kun administratorer kan oppdatere roller'
        })
      }

      // Can't change your own role if you're the only admin
      if (input.memberId === adminMembership.id && input.role !== 'ADMIN') {
        const adminCount = await ctx.db.householdMember.count({
          where: {
            householdId: input.householdId,
            role: 'ADMIN'
          }
        })

        if (adminCount === 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Kan ikke fjerne administrator-rolle fra siste administrator'
          })
        }
      }

      const updatedMembership = await ctx.db.householdMember.update({
        where: { id: input.memberId },
        data: { role: input.role },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })

      // Log activity
      await logActivity({
        type: 'HOUSEHOLD_MEMBER_ROLE_UPDATED',
        description: `Oppdaterte rolle for ${updatedMembership.user.email} til ${input.role}`,
        userId: ctx.user.id
      })

      return updatedMembership
    }),

  // Remove member from household
  removeMember: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      memberId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Get admin membership and target membership
      const [adminMembership, targetMembership] = await Promise.all([
        ctx.db.householdMember.findFirst({
          where: {
            userId: ctx.user.id,
            householdId: input.householdId,
            role: 'ADMIN'
          }
        }),
        ctx.db.householdMember.findFirst({
          where: { id: input.memberId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })
      ])

      // Self-removal or admin removal
      if (!adminMembership && targetMembership?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Du kan kun fjerne deg selv eller være administrator'
        })
      }

      if (!targetMembership) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Medlem ikke funnet'
        })
      }

      // Can't remove last admin
      if (targetMembership.role === 'ADMIN') {
        const adminCount = await ctx.db.householdMember.count({
          where: {
            householdId: input.householdId,
            role: 'ADMIN'
          }
        })

        if (adminCount === 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Kan ikke fjerne siste administrator fra husholdningen'
          })
        }
      }

      await ctx.db.householdMember.delete({
        where: { id: input.memberId }
      })

      // Log activity
      await logActivity({
        type: 'HOUSEHOLD_MEMBER_REMOVED',
        description: `Fjernet ${targetMembership.user.email} fra husholdningen`,
        userId: ctx.user.id
      })

      return { success: true }
    }),

  // Leave household
  leave: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.user.id,
          householdId: input
        },
        include: {
          household: true
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Du er ikke medlem av denne husholdningen'
        })
      }

      // Can't leave if you're the only admin
      if (membership.role === 'ADMIN') {
        const adminCount = await ctx.db.householdMember.count({
          where: {
            householdId: input,
            role: 'ADMIN'
          }
        })

        if (adminCount === 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Du kan ikke forlate husholdningen som siste administrator'
          })
        }
      }

      await ctx.db.householdMember.delete({
        where: { id: membership.id }
      })

      // Log activity
      await logActivity({
        type: 'HOUSEHOLD_LEFT',
        description: `Forlot husholdning: ${membership.household.name}`,
        userId: ctx.user.id
      })

      return { success: true }
    }),

  // Delete household (admin only)
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // Verify user is admin
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.user.id,
          householdId: input,
          role: 'ADMIN'
        },
        include: {
          household: true
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Kun administratorer kan slette husholdningen'
        })
      }

      // Check if household has items
      const itemCount = await ctx.db.item.count({
        where: {
          user: {
            households: {
              some: { householdId: input }
            }
          }
        }
      })

      if (itemCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kan ikke slette husholdning som har gjenstander. Flytt eller slett alle gjenstander først.'
        })
      }

      await ctx.db.household.delete({
        where: { id: input }
      })

      // Log activity
      await logActivity({
        type: 'HOUSEHOLD_DELETED',
        description: `Slettet husholdning: ${membership.household.name}`,
        userId: ctx.user.id
      })

      return { success: true }
    }),

  // Get household statistics
  getStats: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Verify access
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.user.id,
          householdId: input
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Du har ikke tilgang til denne husholdningen'
        })
      }

      // Get all user IDs in household
      const memberIds = await ctx.db.householdMember.findMany({
        where: { householdId: input },
        select: { userId: true }
      }).then(members => members.map(m => m.userId))

      // Get stats
      const [totalItems, totalLocations, totalValue, recentActivities] = await Promise.all([
        ctx.db.item.count({
          where: { userId: { in: memberIds } }
        }),
        ctx.db.location.count({
          where: { userId: { in: memberIds } }
        }),
        ctx.db.item.aggregate({
          where: { 
            userId: { in: memberIds },
            price: { not: null }
          },
          _sum: { price: true }
        }),
        ctx.db.activity.count({
          where: { 
            userId: { in: memberIds },
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        })
      ])

      return {
        totalItems,
        totalLocations,
        totalValue: totalValue._sum.price || 0,
        recentActivities,
        memberCount: memberIds.length
      }
    })
})
