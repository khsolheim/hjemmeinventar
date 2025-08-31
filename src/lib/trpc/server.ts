// tRPC server configuration
import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@/auth'
import { db } from '../db'
import { ZodError } from 'zod'
import superjson from 'superjson'

// Create context for tRPC
export async function createTRPCContext() {
  try {
    const session = await auth()
    
    // Debug logging
    console.log('tRPC Context - Session:', session?.user?.email, 'ID:', session?.user?.id)
    
    return {
      db,
      session,
      user: session?.user ?? null
    }
  } catch (error) {
    console.error('Error creating tRPC context:', error)
    return {
      db,
      session: null,
      user: null
    }
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

// Initialize tRPC (temporarily without superjson for debugging)
const t = initTRPC.context<Context>().create({
  // transformer: superjson, // Temporarily disabled
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    }
  }
})

// Create reusable middleware
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    console.log('❌ Unauthorized access attempt - no session or user')
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Du må være logget inn for å gjøre dette'
    })
  }
  
  console.log('✅ Authenticated access for user:', ctx.session.user.email)
  // Ensure User exists in DB (useful after DB resets)
  try {
    const userId = ctx.session.user.id
    const userEmail = ctx.session.user.email
    if (userId && userEmail) {
      await ctx.db.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: userEmail,
          name: ctx.session.user.name ?? null
        }
      })
    }
  } catch (err) {
    console.error('Failed to ensure user exists:', err)
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user
    }
  })
})

// Export reusable router and procedure helpers
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthenticated)
