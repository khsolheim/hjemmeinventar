import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '../server'
import { LocationType } from '@prisma/client'

// Input validation schemas
const LocationTypeEnum = z.nativeEnum(LocationType)

export const hierarchyRouter = createTRPCRouter({
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
          userId: ctx.session.user.id,
          householdId: input.householdId
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a member of this household'
        })
      }

      const rules = await ctx.db.hierarchyRule.findMany({
        where: {
          householdId: input.householdId
        },
        orderBy: [
          { parentType: 'asc' },
          { childType: 'asc' }
        ]
      })

      return rules
    }),

  // Get all default rule sets
  getDefaultRuleSets: protectedProcedure
    .query(async ({ ctx }) => {
      const ruleSets = await ctx.db.defaultHierarchyRule.findMany({
        orderBy: [
          { ruleSetName: 'asc' },
          { parentType: 'asc' },
          { childType: 'asc' }
        ]
      })

      // Group by rule set name
      const grouped = ruleSets.reduce((acc, rule) => {
        if (!acc[rule.ruleSetName]) {
          acc[rule.ruleSetName] = []
        }
        acc[rule.ruleSetName].push(rule)
        return acc
      }, {} as Record<string, typeof ruleSets>)

      return Object.entries(grouped).map(([name, rules]) => ({
        name,
        rules: rules.filter(r => r.isAllowed)
      }))
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
          userId: ctx.session.user.id,
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
      const defaultRules = await ctx.db.defaultHierarchyRule.findMany({
        where: {
          ruleSetName: input.ruleSetName,
          isAllowed: true
        }
      })

      // Delete existing rules for this household
      await ctx.db.hierarchyRule.deleteMany({
        where: {
          householdId: input.householdId
        }
      })

      // Create new rules based on default set
      const newRules = defaultRules.map(rule => ({
        householdId: input.householdId,
        parentType: rule.parentType,
        childType: rule.childType,
        isAllowed: rule.isAllowed
      }))

      await ctx.db.hierarchyRule.createMany({
        data: newRules
      })

      return { success: true, rulesCreated: newRules.length }
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
          userId: ctx.session.user.id,
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

      // Validate for circular dependencies
      const allowedRules = input.rules.filter(r => r.isAllowed)
      const circularError = validateNoCircularDependencies(allowedRules)
      if (circularError) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Circular dependency detected: ${circularError}`
        })
      }

      // Delete existing rules
      await ctx.db.hierarchyRule.deleteMany({
        where: {
          householdId: input.householdId
        }
      })

      // Create new rules
      const newRules = input.rules.map(rule => ({
        householdId: input.householdId,
        parentType: rule.parentType,
        childType: rule.childType,
        isAllowed: rule.isAllowed
      }))

      await ctx.db.hierarchyRule.createMany({
        data: newRules
      })

      return { success: true, rulesUpdated: newRules.length }
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
          userId: ctx.session.user.id,
          householdId: input.householdId
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a member of this household'
        })
      }

      const rule = await ctx.db.hierarchyRule.findFirst({
        where: {
          householdId: input.householdId,
          parentType: input.parentType,
          childType: input.childType
        }
      })

      return {
        allowed: rule?.isAllowed ?? false,
        rule: rule
      }
    }),

  // Get hierarchy matrix for UI display
  getMatrix: protectedProcedure
    .input(z.object({
      householdId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is member of household
      const membership = await ctx.db.householdMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          householdId: input.householdId
        }
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a member of this household'
        })
      }

      const rules = await ctx.db.hierarchyRule.findMany({
        where: {
          householdId: input.householdId
        }
      })

      // Convert to matrix format for easier UI consumption
      const locationTypes = Object.values(LocationType)
      const matrix: Record<string, Record<string, boolean>> = {}
      
      locationTypes.forEach(parentType => {
        matrix[parentType] = {}
        locationTypes.forEach(childType => {
          const rule = rules.find(r => 
            r.parentType === parentType && r.childType === childType
          )
          matrix[parentType][childType] = rule?.isAllowed ?? false
        })
      })

      return {
        matrix,
        locationTypes
      }
    })
})

// Helper function to validate no circular dependencies
function validateNoCircularDependencies(
  rules: Array<{ parentType: LocationType; childType: LocationType; isAllowed: boolean }>
): string | null {
  const allowedRules = rules.filter(r => r.isAllowed)
  const graph: Record<string, string[]> = {}
  
  // Build adjacency list
  allowedRules.forEach(rule => {
    if (!graph[rule.parentType]) {
      graph[rule.parentType] = []
    }
    graph[rule.parentType].push(rule.childType)
  })

  // Check for cycles using DFS
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCycle(node: string): boolean {
    if (recursionStack.has(node)) {
      return true // Back edge found, cycle detected
    }
    if (visited.has(node)) {
      return false // Already processed
    }

    visited.add(node)
    recursionStack.add(node)

    const neighbors = graph[node] || []
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) {
        return true
      }
    }

    recursionStack.delete(node)
    return false
  }

  // Check all nodes
  for (const node of Object.keys(graph)) {
    if (hasCycle(node)) {
      return `Cycle detected involving ${node}`
    }
  }

  return null
}
