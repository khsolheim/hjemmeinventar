import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const emergencyRouter = createTRPCRouter({
  // Get emergency contacts
  getContacts: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        const contacts = await ctx.db.emergencyContact.findMany({
          where: { userId },
          orderBy: { name: 'asc' }
        })

        return contacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          relationship: contact.relationship,
          priority: contact.priority
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente nødkontakter'
        })
      }
    }),

  // Get important documents
  getDocuments: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        const documents = await ctx.db.importantDocument.findMany({
          where: { userId },
          orderBy: { name: 'asc' }
        })

        return documents.map(document => ({
          id: document.id,
          name: document.name,
          type: document.type,
          location: document.location,
          description: document.description,
          expiryDate: document.expiryDate
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente viktige dokumenter'
        })
      }
    }),

  // Get safety equipment
  getEquipment: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        const equipment = await ctx.db.safetyEquipment.findMany({
          where: { userId },
          orderBy: { nextCheck: 'asc' }
        })

        return equipment.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          location: item.location,
          nextCheck: item.nextCheck,
          lastCheck: item.lastCheck,
          status: item.status
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente sikkerhetsutstyr'
        })
      }
    }),

  // Get emergency plans
  getPlans: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        const plans = await ctx.db.emergencyPlan.findMany({
          where: { userId },
          orderBy: { name: 'asc' }
        })

        return plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          type: plan.type,
          description: plan.description,
          steps: plan.steps,
          lastUpdated: plan.lastUpdated
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente nødplaner'
        })
      }
    }),

  // Add emergency contact
  addContact: protectedProcedure
    .input(z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string().optional(),
      relationship: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        const contact = await ctx.db.emergencyContact.create({
          data: {
            name: input.name,
            phone: input.phone,
            email: input.email,
            relationship: input.relationship,
            priority: 'normal',
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'EMERGENCY_CONTACT_ADDED',
            description: `La til nødkontakt: ${input.name}`,
            userId,
            metadata: {
              contactId: contact.id,
              relationship: input.relationship
            }
          }
        })

        return contact
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke legge til nødkontakt'
        })
      }
    }),

  // Add important document
  addDocument: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.string(),
      location: z.string(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        const document = await ctx.db.importantDocument.create({
          data: {
            name: input.name,
            type: input.type,
            location: input.location,
            description: input.description,
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'DOCUMENT_ADDED',
            description: `La til viktig dokument: ${input.name}`,
            userId,
            metadata: {
              documentId: document.id,
              documentType: input.type
            }
          }
        })

        return document
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke legge til dokument'
        })
      }
    }),

  // Add safety equipment
  addEquipment: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.string(),
      location: z.string(),
      nextCheck: z.date()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        const equipment = await ctx.db.safetyEquipment.create({
          data: {
            name: input.name,
            type: input.type,
            location: input.location,
            nextCheck: input.nextCheck,
            status: 'active',
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'SAFETY_EQUIPMENT_ADDED',
            description: `La til sikkerhetsutstyr: ${input.name}`,
            userId,
            metadata: {
              equipmentId: equipment.id,
              equipmentType: input.type
            }
          }
        })

        return equipment
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke legge til sikkerhetsutstyr'
        })
      }
    }),

  // Add emergency plan
  addPlan: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.string(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        const plan = await ctx.db.emergencyPlan.create({
          data: {
            name: input.name,
            type: input.type,
            description: input.description,
            steps: [],
            userId
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'EMERGENCY_PLAN_ADDED',
            description: `La til nødplan: ${input.name}`,
            userId,
            metadata: {
              planId: plan.id,
              planType: input.type
            }
          }
        })

        return plan
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke legge til nødplan'
        })
      }
    }),

  // Update equipment check
  updateEquipmentCheck: protectedProcedure
    .input(z.object({
      equipmentId: z.string(),
      checked: z.boolean(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Verify user owns the equipment
        const equipment = await ctx.db.safetyEquipment.findFirst({
          where: {
            id: input.equipmentId,
            userId
          }
        })

        if (!equipment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Sikkerhetsutstyr ikke funnet'
          })
        }

        // Update equipment
        const updatedEquipment = await ctx.db.safetyEquipment.update({
          where: { id: input.equipmentId },
          data: {
            lastCheck: new Date(),
            nextCheck: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            status: input.checked ? 'active' : 'needs_attention'
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'EQUIPMENT_CHECKED',
            description: `${input.checked ? 'Kontrollerte' : 'Merkte problemer med'} ${equipment.name}`,
            userId,
            metadata: {
              equipmentId: equipment.id,
              equipmentName: equipment.name,
              checked: input.checked,
              notes: input.notes
            }
          }
        })

        return updatedEquipment
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke oppdatere utstyrskontroll'
        })
      }
    }),

  // Get emergency statistics
  getEmergencyStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        const [contacts, documents, equipment, plans] = await Promise.all([
          ctx.db.emergencyContact.count({ where: { userId } }),
          ctx.db.importantDocument.count({ where: { userId } }),
          ctx.db.safetyEquipment.count({ where: { userId } }),
          ctx.db.emergencyPlan.count({ where: { userId } })
        ])

        // Get equipment that needs attention
        const overdueEquipment = await ctx.db.safetyEquipment.count({
          where: {
            userId,
            nextCheck: {
              lt: new Date()
            }
          }
        })

        return {
          totalContacts: contacts,
          totalDocuments: documents,
          totalEquipment: equipment,
          totalPlans: plans,
          overdueEquipment,
          emergencyScore: calculateEmergencyScore(contacts, documents, equipment, plans, overdueEquipment)
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente nødstatistikk'
        })
      }
    })
})

// Helper function to calculate emergency preparedness score
function calculateEmergencyScore(
  contacts: number,
  documents: number,
  equipment: number,
  plans: number,
  overdueEquipment: number
): number {
  let score = 0
  
  // Contacts (max 25 points)
  score += Math.min(contacts * 5, 25)
  
  // Documents (max 25 points)
  score += Math.min(documents * 5, 25)
  
  // Equipment (max 25 points)
  score += Math.min(equipment * 5, 25)
  
  // Plans (max 25 points)
  score += Math.min(plans * 12.5, 25)
  
  // Penalty for overdue equipment
  score -= overdueEquipment * 5
  
  return Math.max(0, Math.min(100, score))
}
