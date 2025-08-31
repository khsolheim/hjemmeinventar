// LabelSize tRPC router
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const labelSizesRouter = createTRPCRouter({
  // Hent alle størrelser for brukeren
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, session } = ctx

      console.log('🔍 labelSizes.getAll called for user:', session!.user.email, 'ID:', session!.user.id)

      try {
        const labelSizes = await db.labelSize.findMany({
          where: { userId: session!.user.id },
          orderBy: [
            { isDefault: 'desc' },
            { name: 'asc' }
          ]
        })

        console.log('✅ Found', labelSizes.length, 'label sizes for user:', session!.user.email)

        return labelSizes
      } catch (error) {
        console.error('❌ Error fetching label sizes:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente etikett-størrelser'
        })
      }
    }),

  // Hent enkelt størrelse etter ID
  getById: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx

      try {
        const labelSize = await db.labelSize.findFirst({
          where: {
            id: input.id,
            userId: session!.user.id
          }
        })

        if (!labelSize) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Størrelse ikke funnet'
          })
        }

        return labelSize
      } catch (error) {
        console.error('❌ Error fetching label size:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente etikett-størrelse'
        })
      }
    }),

  // Opprett ny størrelse
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, 'Navn er påkrevd'),
      widthMm: z.number().min(1, 'Bredde må være minst 1mm'),
      heightMm: z.number().min(1, 'Høyde må være minst 1mm'),
      description: z.string().optional(),
      isDefault: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx
      
      // Konverter mm til piksler (300 DPI)
      const widthPx = Math.round(input.widthMm * 11.811) // 300 DPI = 11.811 piksler per mm
      const heightPx = Math.round(input.heightMm * 11.811)
      
      // Hvis dette skal være standard, fjern standard fra andre
      if (input.isDefault) {
        await db.labelSize.updateMany({
          where: { userId: session!.user.id, isDefault: true },
          data: { isDefault: false }
        })
      }
      
      const labelSize = await db.labelSize.create({
        data: {
          name: input.name,
          width: widthPx,
          height: heightPx,
          widthMm: input.widthMm,
          heightMm: input.heightMm,
          description: input.description,
          isDefault: input.isDefault,
          userId: session!.user.id
        }
      })
      
      return labelSize
    }),

  // Oppdater eksisterende størrelse
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, 'Navn er påkrevd'),
      widthMm: z.number().min(1, 'Bredde må være minst 1mm'),
      heightMm: z.number().min(1, 'Høyde må være minst 1mm'),
      description: z.string().optional(),
      isDefault: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx
      
      // Sjekk at størrelsen tilhører brukeren
      const existing = await db.labelSize.findFirst({
        where: { id: input.id, userId: session!.user.id }
      })
      
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Størrelse ikke funnet'
        })
      }
      
      // Konverter mm til piksler (300 DPI)
      const widthPx = Math.round(input.widthMm * 11.811)
      const heightPx = Math.round(input.heightMm * 11.811)
      
      // Hvis dette skal være standard, fjern standard fra andre
      if (input.isDefault) {
        await db.labelSize.updateMany({
          where: { userId: session!.user.id, isDefault: true, id: { not: input.id } },
          data: { isDefault: false }
        })
      }
      
      const labelSize = await db.labelSize.update({
        where: { id: input.id },
        data: {
          name: input.name,
          width: widthPx,
          height: heightPx,
          widthMm: input.widthMm,
          heightMm: input.heightMm,
          description: input.description,
          isDefault: input.isDefault
        }
      })
      
      return labelSize
    }),

  // Slett størrelse
  delete: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx
      
      // Sjekk at størrelsen tilhører brukeren
      const existing = await db.labelSize.findFirst({
        where: { id: input.id, userId: session!.user.id }
      })
      
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Størrelse ikke funnet'
        })
      }
      
      await db.labelSize.delete({
        where: { id: input.id }
      })
      
      return { success: true }
    }),

  // Sett som standard
  setDefault: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx
      
      // Sjekk at størrelsen tilhører brukeren
      const existing = await db.labelSize.findFirst({
        where: { id: input.id, userId: session!.user.id }
      })
      
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Størrelse ikke funnet'
        })
      }
      
      // Fjern standard fra alle andre
      await db.labelSize.updateMany({
        where: { userId: session!.user.id },
        data: { isDefault: false }
      })
      
      // Sett denne som standard
      const labelSize = await db.labelSize.update({
        where: { id: input.id },
        data: { isDefault: true }
      })
      
      return labelSize
    })
})
