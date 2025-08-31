import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '../server'
import { LocationType } from '@prisma/client'
import { validateAcyclic } from '@/lib/services/hierarchy-service'

// Global type declaration for in-memory storage
declare global {
  var activeRuleSets: Record<string, 'minimal' | 'standard' | 'extended'> | undefined
}

// Input validation schemas
const LocationTypeEnum = z.nativeEnum(LocationType)

export const hierarchyRouter = createTRPCRouter({
  // Determine which default rule set (if any) is currently active
  getActiveRuleSet: protectedProcedure
    .input(z.object({
      householdId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Verify membership
      const membership = await ctx.db.householdMember.findFirst({
        where: { userId: ctx.session!.user.id, householdId: input.householdId }
      })
      if (!membership) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member of this household' })
      }

      // For now, we'll use a simple in-memory storage per household
      // In the future, this would be stored in the database
      const activeRuleSet = global.activeRuleSets?.[input.householdId] || 'extended'
      return { active: activeRuleSet as 'minimal' | 'standard' | 'extended' | 'custom' | null }
    }),
  // Get current hierarchy rules for user's household
  getRules: protectedProcedure
    .input(z.object({
      householdId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      // TODO: Get user's default household if none specified
      if (!input.householdId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Household ID is required'
        })
      }

      // Check if user is member of household
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.session!.user.id,
          householdId: input.householdId
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a member of this household'
        })
      }

      // const rules = await ctx.db.hierarchyRule.findMany({ // Removed - not in schema
      //   where: {
      //     householdId: input.householdId
      //   },
      //   orderBy: [
      //     { parentType: 'asc' },
      //     { childType: 'asc' }
      //   ]
      // })

      // return rules
      return [] // Placeholder since hierarchyRule not in schema
    }),

  // Get all default rule sets
  getDefaultRuleSets: protectedProcedure
    .query(async ({ ctx }) => {
      // Hardcoded rule sets until database schema is implemented
      const ruleSets = [
        {
          name: 'minimal',
          displayName: 'Minimal',
          description: 'Kun de mest grunnleggende hierarki-reglene',
          rules: [
            { parentType: 'ROOM', childType: 'CABINET' },
            { parentType: 'ROOM', childType: 'SHELF' },
            { parentType: 'CABINET', childType: 'DRAWER' },
            { parentType: 'SHELF', childType: 'BOX' },
            { parentType: 'BOX', childType: 'BAG' }
          ]
        },
        {
          name: 'standard',
          displayName: 'Standard',
          description: 'Balanserte regler for de fleste hjem',
          rules: [
            { parentType: 'ROOM', childType: 'CABINET' },
            { parentType: 'ROOM', childType: 'SHELF' },
            { parentType: 'ROOM', childType: 'RACK' },
            { parentType: 'ROOM', childType: 'CONTAINER' },
            { parentType: 'CABINET', childType: 'DRAWER' },
            { parentType: 'CABINET', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'CABINET', childType: 'BOX' },
            { parentType: 'SHELF', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'SHELF', childType: 'BOX' },
            { parentType: 'SHELF', childType: 'CONTAINER' },
            { parentType: 'RACK', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'RACK', childType: 'BOX' },
            { parentType: 'BOX', childType: 'BAG' },
            { parentType: 'BOX', childType: 'SECTION' },
            { parentType: 'DRAWER', childType: 'SECTION' },
            { parentType: 'DRAWER', childType: 'BAG' }
          ]
        },
        {
          name: 'extended',
          displayName: 'Utvidet',
          description: 'Fleksible regler som tillater de fleste kombinasjoner',
          rules: [
            { parentType: 'ROOM', childType: 'CABINET' },
            { parentType: 'ROOM', childType: 'SHELF' },
            { parentType: 'ROOM', childType: 'RACK' },
            { parentType: 'ROOM', childType: 'WALL_SHELF' },
            { parentType: 'ROOM', childType: 'CONTAINER' },
            { parentType: 'ROOM', childType: 'BOX' },
            { parentType: 'ROOM', childType: 'DRAWER' },
            { parentType: 'CABINET', childType: 'DRAWER' },
            { parentType: 'CABINET', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'CABINET', childType: 'SHELF' },
            { parentType: 'CABINET', childType: 'BOX' },
            { parentType: 'CABINET', childType: 'CONTAINER' },
            { parentType: 'CABINET', childType: 'BAG' },
            { parentType: 'SHELF', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'SHELF', childType: 'BOX' },
            { parentType: 'SHELF', childType: 'CONTAINER' },
            { parentType: 'SHELF', childType: 'BAG' },
            { parentType: 'SHELF', childType: 'DRAWER' },
            { parentType: 'RACK', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'RACK', childType: 'BOX' },
            { parentType: 'RACK', childType: 'CONTAINER' },
            { parentType: 'RACK', childType: 'BAG' },
            { parentType: 'RACK', childType: 'DRAWER' },
            { parentType: 'WALL_SHELF', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'WALL_SHELF', childType: 'BOX' },
            { parentType: 'WALL_SHELF', childType: 'BAG' },
            { parentType: 'WALL_SHELF', childType: 'CONTAINER' },
            { parentType: 'BOX', childType: 'BAG' },
            { parentType: 'BOX', childType: 'SECTION' },
            { parentType: 'BOX', childType: 'CONTAINER' },
            { parentType: 'DRAWER', childType: 'SECTION' },
            { parentType: 'DRAWER', childType: 'BAG' },
            { parentType: 'DRAWER', childType: 'CONTAINER' },
            { parentType: 'DRAWER', childType: 'BOX' },
            { parentType: 'CONTAINER', childType: 'BAG' },
            { parentType: 'CONTAINER', childType: 'SECTION' },
            { parentType: 'CONTAINER', childType: 'BOX' },
            { parentType: 'SHELF_COMPARTMENT', childType: 'BOX' },
            { parentType: 'SHELF_COMPARTMENT', childType: 'BAG' },
            { parentType: 'SHELF_COMPARTMENT', childType: 'CONTAINER' },
            { parentType: 'SHELF_COMPARTMENT', childType: 'SECTION' },
            { parentType: 'SECTION', childType: 'BAG' }
          ]
        }
      ]

      return ruleSets
    }),

  // Get current hierarchy matrix for user's household
  getMatrix: protectedProcedure
    .input(z.object({
      householdId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is member of household
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.session!.user.id,
          householdId: input.householdId
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a member of this household'
        })
      }

      // Get the active rule set for this household
      const activeRuleSetName = global.activeRuleSets?.[input.householdId] || 'extended'
      
      // Get the rule sets
      const ruleSets = [
        {
          name: 'minimal',
          rules: [
            { parentType: 'ROOM', childType: 'CABINET' },
            { parentType: 'ROOM', childType: 'SHELF' },
            { parentType: 'CABINET', childType: 'DRAWER' },
            { parentType: 'SHELF', childType: 'BOX' },
            { parentType: 'BOX', childType: 'BAG' }
          ]
        },
        {
          name: 'standard',
          rules: [
            { parentType: 'ROOM', childType: 'CABINET' },
            { parentType: 'ROOM', childType: 'SHELF' },
            { parentType: 'ROOM', childType: 'RACK' },
            { parentType: 'ROOM', childType: 'CONTAINER' },
            { parentType: 'CABINET', childType: 'DRAWER' },
            { parentType: 'CABINET', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'CABINET', childType: 'BOX' },
            { parentType: 'SHELF', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'SHELF', childType: 'BOX' },
            { parentType: 'SHELF', childType: 'CONTAINER' },
            { parentType: 'RACK', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'RACK', childType: 'BOX' },
            { parentType: 'BOX', childType: 'BAG' },
            { parentType: 'BOX', childType: 'SECTION' },
            { parentType: 'DRAWER', childType: 'SECTION' },
            { parentType: 'DRAWER', childType: 'BAG' }
          ]
        },
        {
          name: 'extended',
          rules: [
            { parentType: 'ROOM', childType: 'CABINET' },
            { parentType: 'ROOM', childType: 'SHELF' },
            { parentType: 'ROOM', childType: 'RACK' },
            { parentType: 'ROOM', childType: 'WALL_SHELF' },
            { parentType: 'ROOM', childType: 'CONTAINER' },
            { parentType: 'ROOM', childType: 'BOX' },
            { parentType: 'ROOM', childType: 'DRAWER' },
            { parentType: 'CABINET', childType: 'DRAWER' },
            { parentType: 'CABINET', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'CABINET', childType: 'SHELF' },
            { parentType: 'CABINET', childType: 'BOX' },
            { parentType: 'CABINET', childType: 'CONTAINER' },
            { parentType: 'CABINET', childType: 'BAG' },
            { parentType: 'SHELF', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'SHELF', childType: 'BOX' },
            { parentType: 'SHELF', childType: 'CONTAINER' },
            { parentType: 'SHELF', childType: 'BAG' },
            { parentType: 'SHELF', childType: 'DRAWER' },
            { parentType: 'RACK', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'RACK', childType: 'BOX' },
            { parentType: 'RACK', childType: 'CONTAINER' },
            { parentType: 'RACK', childType: 'BAG' },
            { parentType: 'RACK', childType: 'DRAWER' },
            { parentType: 'WALL_SHELF', childType: 'SHELF_COMPARTMENT' },
            { parentType: 'WALL_SHELF', childType: 'BOX' },
            { parentType: 'WALL_SHELF', childType: 'BAG' },
            { parentType: 'WALL_SHELF', childType: 'CONTAINER' },
            { parentType: 'BOX', childType: 'BAG' },
            { parentType: 'BOX', childType: 'SECTION' },
            { parentType: 'BOX', childType: 'CONTAINER' },
            { parentType: 'DRAWER', childType: 'SECTION' },
            { parentType: 'DRAWER', childType: 'BAG' },
            { parentType: 'DRAWER', childType: 'CONTAINER' },
            { parentType: 'DRAWER', childType: 'BOX' },
            { parentType: 'CONTAINER', childType: 'BAG' },
            { parentType: 'CONTAINER', childType: 'SECTION' },
            { parentType: 'CONTAINER', childType: 'BOX' },
            { parentType: 'SHELF_COMPARTMENT', childType: 'BOX' },
            { parentType: 'SHELF_COMPARTMENT', childType: 'BAG' },
            { parentType: 'SHELF_COMPARTMENT', childType: 'CONTAINER' },
            { parentType: 'SHELF_COMPARTMENT', childType: 'SECTION' },
            { parentType: 'SECTION', childType: 'BAG' }
          ]
        }
      ]
      
      // Find the active rule set
      const activeRuleSet = ruleSets.find(rs => rs.name === activeRuleSetName) || ruleSets[2] // Default to extended
      
      const locationTypes = Object.values(LocationType)
      const matrix: Record<string, Record<string, boolean>> = {}

      // Initialize matrix with all false
      locationTypes.forEach(parentType => {
        matrix[parentType] = {}
        locationTypes.forEach(childType => {
          matrix[parentType][childType] = false
        })
      })

      // Apply active rule set rules to matrix
      activeRuleSet.rules.forEach(rule => {
        if (matrix[rule.parentType]) {
          matrix[rule.parentType][rule.childType] = true
        }
      })

      return {
        matrix,
        locationTypes
      }
    }),

  // Apply a default rule set to user's household
  applyDefaultRuleSet: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      ruleSetName: z.enum(['minimal', 'standard', 'extended'])
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin rights in household
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.session!.user.id,
          householdId: input.householdId,
          role: { in: ['ADMIN'] }
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only household admins can modify hierarchy rules'
        })
      }

      // Get default rules for the specified rule set
      // const defaultRules = await ctx.db.defaultHierarchyRule.findMany({ // Removed - not in schema
      //   where: {
      //     ruleSetName: input.ruleSetName,
      //     isAllowed: true
      //   }
      // })

      // // Delete existing rules for this household
      // await ctx.db.hierarchyRule.deleteMany({ // Removed - not in schema
      //   where: {
      //     householdId: input.householdId
      //   }
      // })

      // // Create new rules based on default set
      // const newRules = defaultRules.map(rule => ({
      //   householdId: input.householdId,
      //   parentType: rule.parentType,
      //   childType: rule.childType,
      //   isAllowed: rule.isAllowed
      // }))

      // await ctx.db.hierarchyRule.createMany({ // Removed - not in schema
      //   data: newRules
      // })

      // Store the active rule set in memory (in the future, this would be in database)
      if (!global.activeRuleSets) {
        global.activeRuleSets = {}
      }
      global.activeRuleSets[input.householdId] = input.ruleSetName

      const ruleSetSizes = {
        minimal: 5,
        standard: 16,
        extended: 42
      }

      const displayNames = {
        minimal: 'Minimal',
        standard: 'Standard', 
        extended: 'Utvidet'
      }

      return { 
        success: true, 
        rulesCreated: ruleSetSizes[input.ruleSetName],
        message: `${displayNames[input.ruleSetName]} regel-sett ble aktivert!`
      }
    }),

  // Update individual hierarchy rules
  updateRules: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      rules: z.array(z.object({
        parentType: LocationTypeEnum,
        childType: LocationTypeEnum,
        isAllowed: z.boolean()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin rights in household
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.session!.user.id,
          householdId: input.householdId,
          role: { in: ['ADMIN'] }
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only household admins can modify hierarchy rules'
        })
      }

      // Validate for circular dependencies (server-side)
      const circularError = validateAcyclic(input.rules)
      if (circularError) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Circular dependency detected: ${circularError}`
        })
      }

      // Delete existing rules
      // await ctx.db.hierarchyRule.deleteMany({ // Removed - not in schema
      //   where: {
      //     householdId: input.householdId
      //   }
      // })

      // // Create new rules
      // const newRules = input.rules.map(rule => ({
      //   householdId: input.householdId,
      //   parentType: rule.parentType,
      //   childType: rule.childType,
      //   isAllowed: rule.isAllowed
      // }))

      // await ctx.db.hierarchyRule.createMany({ // Removed - not in schema
      //   data: newRules
      // })

      // return { success: true, rulesUpdated: newRules.length }
      return { success: true, rulesUpdated: 0 } // Placeholder since hierarchyRule not in schema
    }),

  // Check if a specific hierarchy relationship is allowed
  canPlace: protectedProcedure
    .input(z.object({
      householdId: z.string(),
      parentType: LocationTypeEnum,
      childType: LocationTypeEnum
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is member of household
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.session!.user.id,
          householdId: input.householdId
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a member of this household'
        })
      }

      // const rule = await ctx.db.hierarchyRule.findFirst({ // Removed - not in schema
      //   where: {
      //     householdId: input.householdId,
      //     parentType: input.parentType,
      //     childType: input.childType
      //   }
      // })

      // return {
      //   allowed: rule?.isAllowed ?? false,
      //   rule: rule
      // }
      return {
        allowed: false, // Placeholder since hierarchyRule not in schema
        rule: null
      }
    }),


})
