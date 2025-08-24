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

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  // Remove superjson transformer temporarily to fix serialization issues
  // transformer: superjson,
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
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    console.log('❌ Unauthorized access attempt - no session or user')
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Du må være logget inn for å gjøre dette'
    })
  }
  
  console.log('✅ Authenticated access for user:', ctx.session.user.email)
  
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
