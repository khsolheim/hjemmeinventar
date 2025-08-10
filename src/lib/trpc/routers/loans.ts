// Loans tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { logActivity } from '../../db'
import { inventoryEvents } from '../../inngest/services/inventory-events'

export const loansRouter = createTRPCRouter({
  // Create new loan
  create: protectedProcedure
    .input(z.object({
      itemId: z.string(),
      loanedTo: z.string().min(1),
      contactInfo: z.string().optional(),
      expectedReturnDate: z.date().optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if item exists and belongs to user
      const item = await ctx.db.item.findFirst({
        where: {
          id: input.itemId,
          userId: ctx.user.id
        }
      })
      
      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Gjenstand ikke funnet'
        })
      }
      
      // Check if item is already loaned
      const existingLoan = await ctx.db.loan.findFirst({
        where: {
          itemId: input.itemId,
          status: { in: ['OUT', 'OVERDUE'] }
        }
      })
      
      if (existingLoan) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Gjenstanden er allerede utlånt'
        })
      }
      
      const loan = await ctx.db.loan.create({
        data: {
          ...input,
          userId: ctx.user.id,
          status: 'OUT'
        },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          }
        }
      })
      
      // Log activity
      await logActivity({
        type: 'LOAN_CREATED',
        description: `Lånte ut ${item.name} til ${input.loanedTo}`,
        userId: ctx.user.id,
        itemId: input.itemId
      })
      
      // Trigger background jobs
      await inventoryEvents.onLoanCreated({
        loanId: loan.id,
        itemId: loan.itemId,
        userId: ctx.user.id,
        loanedTo: loan.loanedTo,
        expectedReturnDate: loan.expectedReturnDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default 14 days
      })
      
      return loan
    }),
    
  // Return loan
  return: protectedProcedure
    .input(z.object({
      loanId: z.string(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const loan = await ctx.db.loan.findFirst({
        where: {
          id: input.loanId,
          userId: ctx.user.id,
          status: { in: ['OUT', 'OVERDUE'] }
        },
        include: {
          item: true
        }
      })
      
      if (!loan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utlån ikke funnet eller allerede returnert'
        })
      }
      
      const updatedLoan = await ctx.db.loan.update({
        where: { id: input.loanId },
        data: {
          status: 'RETURNED',
          actualReturnDate: new Date(),
          notes: input.notes ? `${loan.notes || ''}${loan.notes ? '\n\n' : ''}Retur: ${input.notes}` : loan.notes
        },
        include: {
          item: true
        }
      })
      
      // Log activity
      await logActivity({
        type: 'LOAN_RETURNED',
        description: `${loan.item.name} returnert fra ${loan.loanedTo}`,
        userId: ctx.user.id,
        itemId: loan.itemId
      })
      
      return updatedLoan
    }),
    
  // Get all loans for user
  getUserLoans: protectedProcedure
    .input(z.object({
      status: z.enum(['OUT', 'RETURNED', 'OVERDUE']).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.user.id
      }
      
      if (input.status) {
        where.status = input.status
      }
      
      const [loans, total] = await Promise.all([
        ctx.db.loan.findMany({
          where,
          include: {
            item: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                category: {
                  select: {
                    name: true,
                    icon: true
                  }
                }
              }
            }
          },
          orderBy: { loanDate: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.loan.count({ where })
      ])
      
      return loans
    }),
    
  // Get active loans (OUT or OVERDUE)
  getActiveLoans: protectedProcedure
    .query(async ({ ctx }) => {
      const loans = await ctx.db.loan.findMany({
        where: {
          userId: ctx.user.id,
          status: { in: ['OUT', 'OVERDUE'] }
        },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              category: {
                select: {
                  name: true,
                  icon: true
                }
              }
            }
          }
        },
        orderBy: { expectedReturnDate: 'asc' }
      })
      
      return loans
    }),
    
  // Get overdue loans
  getOverdueLoans: protectedProcedure
    .query(async ({ ctx }) => {
      const loans = await ctx.db.loan.findMany({
        where: {
          userId: ctx.user.id,
          status: 'OVERDUE'
        },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              category: {
                select: {
                  name: true,
                  icon: true
                }
              }
            }
          }
        },
        orderBy: { expectedReturnDate: 'asc' }
      })
      
      return loans
    }),
    
  // Get loan by ID
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const loan = await ctx.db.loan.findFirst({
        where: {
          id: input,
          userId: ctx.user.id
        },
        include: {
          item: {
            include: {
              category: true,
              location: true
            }
          }
        }
      })
      
      if (!loan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utlån ikke funnet'
        })
      }
      
      return loan
    }),
    
  // Update loan (extend return date, add notes, etc.)
  update: protectedProcedure
    .input(z.object({
      loanId: z.string(),
      expectedReturnDate: z.date().optional(),
      contactInfo: z.string().optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { loanId, ...updateData } = input
      
      const loan = await ctx.db.loan.findFirst({
        where: {
          id: loanId,
          userId: ctx.user.id,
          status: { in: ['OUT', 'OVERDUE'] }
        }
      })
      
      if (!loan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utlån ikke funnet eller allerede returnert'
        })
      }
      
      const updatedLoan = await ctx.db.loan.update({
        where: { id: loanId },
        data: updateData,
        include: {
          item: true
        }
      })
      
      return updatedLoan
    }),
    
  // Mark loan as overdue (typically called by background job)
  markOverdue: protectedProcedure
    .input(z.object({
      loanIds: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.user.id,
        status: 'OUT',
        expectedReturnDate: {
          lt: new Date()
        }
      }
      
      if (input.loanIds) {
        where.id = { in: input.loanIds }
      }
      
      const result = await ctx.db.loan.updateMany({
        where,
        data: {
          status: 'OVERDUE'
        }
      })
      
      return {
        updatedCount: result.count,
        message: `Markerte ${result.count} utlån som forsinkede`
      }
    }),
    
  // Get loan statistics
  getStats: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(365).default(30)
    }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)
      
      const [
        activeLoans,
        overdueLoans,
        totalLoans,
        recentLoans
      ] = await Promise.all([
        ctx.db.loan.count({
          where: {
            userId: ctx.user.id,
            status: 'OUT'
          }
        }),
        ctx.db.loan.count({
          where: {
            userId: ctx.user.id,
            status: 'OVERDUE'
          }
        }),
        ctx.db.loan.count({
          where: {
            userId: ctx.user.id
          }
        }),
        ctx.db.loan.count({
          where: {
            userId: ctx.user.id,
            loanDate: { gte: startDate }
          }
        })
      ])
      
      // Get most borrowed items
      const popularItems = await ctx.db.loan.groupBy({
        by: ['itemId'],
        where: {
          userId: ctx.user.id
        },
        _count: true,
        orderBy: {
          _count: {
            itemId: 'desc'
          }
        },
        take: 5
      })
      
      // Get item details for popular items
      const popularItemsWithDetails = await Promise.all(
        popularItems.map(async (item) => {
          const itemDetails = await ctx.db.item.findUnique({
            where: { id: item.itemId },
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          })
          return {
            ...itemDetails,
            loanCount: item._count
          }
        })
      )
      
      const returnedLoans = await ctx.db.loan.count({
        where: {
          userId: ctx.user.id,
          status: 'RETURNED'
        }
      })

      return {
        active: activeLoans,
        overdue: overdueLoans,
        returned: returnedLoans,
        total: totalLoans,
        recent: recentLoans,
        popularItems: popularItemsWithDetails.filter(Boolean)
      }
    }),
    
  // Delete loan
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const loan = await ctx.db.loan.findFirst({
        where: {
          id: input,
          userId: ctx.user.id
        },
        include: {
          item: true
        }
      })
      
      if (!loan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utlån ikke funnet'
        })
      }
      
      await ctx.db.loan.delete({
        where: { id: input }
      })

      // Log activity
      await logActivity({
        type: 'LOAN_RETURNED', // Reuse this activity type
        description: `Utlån av ${loan.item.name} til ${loan.loanedTo} ble slettet`,
        userId: ctx.user.id,
        itemId: loan.itemId
      })
      
      return { success: true }
    })
})
