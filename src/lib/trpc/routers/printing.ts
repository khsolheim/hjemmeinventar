// ============================================================================
// PRINTING SYSTEM - Temporarily disabled due to missing schema models
// ============================================================================

import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

// Placeholder router - printing functionality temporarily disabled
export const printingRouter = createTRPCRouter({
  // Placeholder procedure
  placeholder: protectedProcedure
    .input(z.object({}))
    .query(async () => {
      return { message: 'Printing functionality temporarily disabled' }
    })
})
