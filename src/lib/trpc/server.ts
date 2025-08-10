// tRPC server configuration
import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@/auth'
import { db } from '../db'
import { ZodError } from 'zod'
import superjson from 'superjson'

// Create context for tRPC
export async function createTRPCContext() {
  const session = await auth()
  
  return {
    db,
    session,
    user: session?.user ?? null
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
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Du må være logget inn for å gjøre dette'
    })
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
