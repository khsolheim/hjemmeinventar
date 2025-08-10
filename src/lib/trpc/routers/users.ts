// User management router
import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../server'
import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Navnet må være minst 2 tegn'),
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(6, 'Passordet må være minst 6 tegn')
})

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  image: z.string().url().optional()
})

export const usersRouter = createTRPCRouter({
  // Test endpoint
  test: publicProcedure
    .query(() => {
      return { message: 'Test OK' }
    }),

  // Public registration endpoint
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { name, email, password } = input

        // Check if user already exists
        const existingUser = await ctx.db.user.findUnique({
          where: { email }
        })

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'En bruker med denne e-postadressen eksisterer allerede'
          })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await ctx.db.user.create({
          data: {
            name,
            email,
            password: hashedPassword
          },
          select: {
            id: true,
            name: true,
            email: true
          }
        })

        return {
          success: true,
          message: 'Bruker opprettet'
        }
      } catch (error) {
        console.error('User registration error:', error)
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette bruker'
        })
      }
    }),

  // Get current user profile
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          _count: {
            select: {
              items: true,
              locations: true,
              activities: true
            }
          }
        }
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bruker ikke funnet'
        })
      }

      return user
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          updatedAt: true
        }
      })

      return {
        success: true,
        message: 'Profil oppdatert',
        user: updatedUser
      }
    }),

  // Delete user account
  deleteAccount: protectedProcedure
    .mutation(async ({ ctx }) => {
      // This will cascade delete all related data due to our Prisma schema
      await ctx.db.user.delete({
        where: { id: ctx.user.id }
      })

      return {
        success: true,
        message: 'Konto slettet'
      }
    }),

  // Get user statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const stats = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          _count: {
            select: {
              items: true,
              locations: true,
              activities: true,
              yarnPatterns: true,
              yarnProjects: true,
              tags: true
            }
          }
        }
      })

      if (!stats) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Brukerstatistikk ikke funnet'
        })
      }

      return stats._count
    })
})
