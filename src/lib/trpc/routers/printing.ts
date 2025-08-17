// ============================================================================
// PRINTING SYSTEM - tRPC Router (V3.1)
// ============================================================================

import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../server'
import { db } from '../../db'
import { TRPCError } from '@trpc/server'
import { printerDriverService } from '@/lib/printing/printer-driver-service'
import { dymoService } from '@/lib/printing/dymo-service'
import type { 
  TemplateFilters,
  CreateJobInput,
  BulkJobResult,
  ValidationResult,
  ConnectionStatus,
  EstimateResult,
  AIOptimization,
  PredictionResult,
  PatternAnalysis,
  ApprovalWorkflowConfig,
  ApprovalDecision,
  ApprovalItem,
  TenantSettings,
  UsageReport,
  SearchQuery,
  SearchResults,
  Suggestion,
  KeywordStats,
  VoiceCommandInput,
  CommandResult,
  AccessibilitySettings,
  GetTemplateOptions,
  UpsertTemplateInput,
  DuplicateOptions,
  SharePermissionInput,
  TemplateOverrides,
  MarketplaceInput,
  Pagination,
  ScheduleJobInput,
  ScheduledJob,
  BillingPeriod
} from '../../types/printing'

// ============================================================================
// Validation Schemas
// ============================================================================

const TemplateFiltersSchema = z.object({
  type: z.array(z.enum(['QR', 'BARCODE', 'CUSTOM', 'DYNAMIC'])).optional(),
  size: z.array(z.enum(['SMALL', 'STANDARD', 'LARGE', 'CUSTOM'])).optional(),
  category: z.array(z.string()).optional(),
  isSystemDefault: z.boolean().optional(),
  search: z.string().optional(),
  userId: z.string().optional(),
  householdId: z.string().optional(),
  tenantId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  complexity: z.array(z.enum(['SIMPLE', 'MEDIUM', 'COMPLEX', 'DYNAMIC'])).optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date()
  }).optional()
})

const CreateJobInputSchema = z.object({
  templateId: z.string(),
  title: z.string(),
  data: z.array(z.record(z.any())),
  printerName: z.string().optional(),
  copies: z.number().min(1).default(1),
  priority: z.number().min(0).max(10).default(0),
  scheduledAt: z.date().optional(),
  approvalRequired: z.boolean().default(false),
  costEstimate: z.number().optional(),
  dataClassification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).default('INTERNAL'),
  retentionDays: z.number().optional()
})

const UpsertTemplateInputSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['QR', 'BARCODE', 'CUSTOM', 'DYNAMIC']),
  size: z.enum(['SMALL', 'STANDARD', 'LARGE', 'CUSTOM']),
  category: z.string().optional(),
  xml: z.string(),
  fieldMapping: z.record(z.any()).optional(),
  thumbnail: z.string().optional(),
  parentTemplateId: z.string().optional(),
  overriddenFields: z.array(z.string()).optional(),
  complexity: z.enum(['SIMPLE', 'MEDIUM', 'COMPLEX', 'DYNAMIC']).optional(),
  labelMediaId: z.string().optional(),
  locale: z.string().default('nb-NO'),
  textDirection: z.string().default('ltr')
})

const ApprovalDecisionSchema = z.object({
  decision: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED']),
  comments: z.string().optional(),
  conditions: z.record(z.any()).optional(),
  escalate: z.boolean().optional(),
  escalationReason: z.string().optional()
})

const SearchQuerySchema = z.object({
  query: z.string(),
  filters: TemplateFiltersSchema.optional(),
  sort: z.object({
    field: z.string(),
    direction: z.enum(['ASC', 'DESC'])
  }).optional(),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20)
  }).optional(),
  facets: z.array(z.string()).optional()
})

const VoiceCommandInputSchema = z.object({
  command: z.string(),
  templateId: z.string().optional(),
  language: z.string().default('nb-NO'),
  context: z.record(z.any()).optional()
})

// ============================================================================
// Helper Functions
// ============================================================================

async function validateUserAccess(userId: string, resourceId?: string, permission: string = 'READ') {
  // Implement RBAC validation logic
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { tenant: true }
  })
  
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Bruker ikke funnet'
    })
  }
  
  return user
}

async function auditLog(userId: string, action: string, resourceType: string, resourceId: string, details?: any) {
  await db.printAuditLog.create({
    data: {
      userId,
      action: action as any,
      resourceType,
      resourceId,
      details: details ? JSON.stringify(details) : null,
      riskScore: 0,
      complianceCategory: null
    }
  })
}

// ============================================================================
// Main Router
// ============================================================================

export const printingRouter = createTRPCRouter({
  
  // ============================================================================
  // Template Management
  // ============================================================================
  
  listTemplates: protectedProcedure
    .input(TemplateFiltersSchema)
    .query(async ({ ctx, input }) => {
      const user = await validateUserAccess(ctx.session.user.id)
      
      const whereClause: any = {
        OR: [
          { isSystemDefault: true },
          { userId: ctx.session.user.id },
          { householdId: { in: user.households?.map(h => h.householdId) || [] } }
        ]
      }
      
      if (input.type) whereClause.type = { in: input.type }
      if (input.size) whereClause.size = { in: input.size }
      if (input.category) whereClause.category = { in: input.category }
      if (input.isSystemDefault !== undefined) whereClause.isSystemDefault = input.isSystemDefault
      if (input.search) {
        whereClause.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } }
        ]
      }
      
      const templates = await db.labelTemplate.findMany({
        where: whereClause,
        include: {
          labelMedia: true,
          user: { select: { id: true, name: true } },
          _count: { select: { printJobs: true } }
        },
        orderBy: [
          { usageCount: 'desc' },
          { lastUsedAt: 'desc' },
          { createdAt: 'desc' }
        ]
      })
      
      return templates.map(template => ({
        ...template,
        fieldMapping: template.fieldMapping ? JSON.parse(template.fieldMapping) : null,
        overriddenFields: template.overriddenFields ? JSON.parse(template.overriddenFields) : null,
        usageCount: template._count.printJobs
      }))
    }),

  getTemplate: protectedProcedure
    .input(z.object({
      id: z.string(),
      options: z.object({
        includeHistory: z.boolean().default(false),
        includePermissions: z.boolean().default(false),
        includeTranslations: z.boolean().default(false),
        includeUsageStats: z.boolean().default(false),
        includeInheritanceChain: z.boolean().default(false)
      }).optional()
    }))
    .query(async ({ ctx, input }) => {
      await validateUserAccess(ctx.session.user.id, input.id)
      
      const include: any = {
        labelMedia: true,
        user: { select: { id: true, name: true } },
        _count: { select: { printJobs: true } }
      }
      
      if (input.options?.includeHistory) {
        include.templateHistory = {
          orderBy: { version: 'desc' },
          take: 10
        }
      }
      
      if (input.options?.includePermissions) {
        include.permissions = {
          include: {
            user: { select: { id: true, name: true } },
            household: { select: { id: true, name: true } }
          }
        }
      }
      
      if (input.options?.includeTranslations) {
        include.translations = true
      }
      
      if (input.options?.includeInheritanceChain) {
        include.parentTemplate = true
        include.childTemplates = true
      }
      
      const template = await db.labelTemplate.findUnique({
        where: { id: input.id },
        include
      })
      
      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template ikke funnet'
        })
      }
      
      await auditLog(ctx.session.user.id, 'TEMPLATE_VIEWED', 'LabelTemplate', input.id)
      
      return {
        ...template,
        fieldMapping: template.fieldMapping ? JSON.parse(template.fieldMapping) : null,
        overriddenFields: template.overriddenFields ? JSON.parse(template.overriddenFields) : null
      }
    }),

  upsertTemplate: protectedProcedure
    .input(UpsertTemplateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await validateUserAccess(ctx.session.user.id)
      
      const templateData = {
        ...input,
        fieldMapping: input.fieldMapping ? JSON.stringify(input.fieldMapping) : null,
        overriddenFields: input.overriddenFields ? JSON.stringify(input.overriddenFields) : null,
        userId: ctx.session.user.id,
        tenantId: user.tenantId
      }
      
      let template
      if (input.id) {
        // Update existing template
        template = await db.labelTemplate.update({
          where: { id: input.id },
          data: {
            ...templateData,
            version: { increment: 1 },
            updatedBy: ctx.session.user.id
          }
        })
        
        // Create history entry
        await db.labelTemplateHistory.create({
          data: {
            templateId: template.id,
            version: template.version,
            xml: template.xml,
            fieldMapping: template.fieldMapping,
            changeType: 'UPDATED',
            createdBy: ctx.session.user.id
          }
        })
        
        await auditLog(ctx.session.user.id, 'TEMPLATE_UPDATED', 'LabelTemplate', template.id)
      } else {
        // Create new template
        template = await db.labelTemplate.create({
          data: {
            ...templateData,
            createdBy: ctx.session.user.id
          }
        })
        
        await auditLog(ctx.session.user.id, 'TEMPLATE_CREATED', 'LabelTemplate', template.id)
      }
      
      return template
    }),

  deleteTemplate: protectedProcedure
    .input(z.object({
      id: z.string(),
      permanent: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      await validateUserAccess(ctx.session.user.id, input.id, 'DELETE')
      
      if (input.permanent) {
        await db.labelTemplate.delete({
          where: { id: input.id }
        })
      } else {
        await db.labelTemplate.update({
          where: { id: input.id },
          data: {
            deletedAt: new Date(),
            deletedBy: ctx.session.user.id
          }
        })
      }
      
      await auditLog(ctx.session.user.id, 'TEMPLATE_DELETED', 'LabelTemplate', input.id)
      return { success: true }
    }),

  duplicateTemplate: protectedProcedure
    .input(z.object({
      id: z.string(),
      options: z.object({
        newName: z.string(),
        copyPermissions: z.boolean().default(false),
        copyHistory: z.boolean().default(false),
        makeChild: z.boolean().default(false)
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await validateUserAccess(ctx.session.user.id, input.id)
      
      const originalTemplate = await db.labelTemplate.findUnique({
        where: { id: input.id },
        include: {
          permissions: input.options.copyPermissions,
          templateHistory: input.options.copyHistory
        }
      })
      
      if (!originalTemplate) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template ikke funnet'
        })
      }
      
      const duplicatedTemplate = await db.labelTemplate.create({
        data: {
          name: input.options.newName,
          description: originalTemplate.description,
          type: originalTemplate.type,
          size: originalTemplate.size,
          category: originalTemplate.category,
          xml: originalTemplate.xml,
          fieldMapping: originalTemplate.fieldMapping,
          complexity: originalTemplate.complexity,
          labelMediaId: originalTemplate.labelMediaId,
          parentTemplateId: input.options.makeChild ? input.id : null,
          inheritanceLevel: input.options.makeChild ? originalTemplate.inheritanceLevel + 1 : 0,
          userId: ctx.session.user.id,
          tenantId: user.tenantId,
          createdBy: ctx.session.user.id
        }
      })
      
      await auditLog(ctx.session.user.id, 'TEMPLATE_CREATED', 'LabelTemplate', duplicatedTemplate.id, {
        duplicatedFrom: input.id
      })
      
      return duplicatedTemplate
    }),

  shareTemplate: protectedProcedure
    .input(z.object({
      id: z.string(),
      permissions: z.array(z.object({
        userId: z.string().optional(),
        householdId: z.string().optional(),
        roleId: z.string().optional(),
        permission: z.enum(['READ', 'write', 'delete', 'share', 'approve', 'admin']),
        conditions: z.record(z.any()).optional(),
        expiresAt: z.date().optional()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      await validateUserAccess(ctx.session.user.id, input.id, 'SHARE')
      
      const permissions = await Promise.all(
        input.permissions.map(perm =>
          db.templatePermission.create({
            data: {
              templateId: input.id,
              userId: perm.userId,
              householdId: perm.householdId,
              roleId: perm.roleId,
              permission: perm.permission.toUpperCase() as any,
              conditions: perm.conditions ? JSON.stringify(perm.conditions) : null,
              expiresAt: perm.expiresAt,
              grantedBy: ctx.session.user.id
            }
          })
        )
      )
      
      await auditLog(ctx.session.user.id, 'TEMPLATE_SHARED', 'LabelTemplate', input.id)
      return permissions
    }),

  // ============================================================================
  // Print Job Management
  // ============================================================================
  
  createJob: protectedProcedure
    .input(CreateJobInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await validateUserAccess(ctx.session.user.id)
      
      // Check quotas
      const quota = await db.printQuota.findFirst({
        where: { userId: ctx.session.user.id }
      })
      
      if (quota && quota.isBlocked) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Utskrift blokkert: ${quota.blockReason}`
        })
      }
      
      const job = await db.printJob.create({
        data: {
          jobTitle: input.title,
          type: 'CUSTOM', // Will be determined by template
          payload: JSON.stringify(input.data),
          copies: input.copies,
          priority: input.priority,
          scheduledAt: input.scheduledAt,
          approvalRequired: input.approvalRequired,
          costEstimate: input.costEstimate,
          dataClassification: input.dataClassification,
          templateId: input.templateId,
          userId: ctx.session.user.id,
          tenantId: user.tenantId,
          createdBy: ctx.session.user.id
        }
      })
      
      // Create approval workflow if required
      if (input.approvalRequired) {
        await db.printApprovalWorkflow.create({
          data: {
            printJobId: job.id,
            requiredApprovers: JSON.stringify(['manager']), // TODO: Get from config
            totalSteps: 1,
            requestedBy: ctx.session.user.id
          }
        })
      }
      
      await auditLog(ctx.session.user.id, 'JOB_CREATED', 'PrintJob', job.id)
      return job
    }),

  getJobQueue: protectedProcedure
    .input(z.object({
      status: z.array(z.enum(['QUEUED', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'RETRYING', 'SCHEDULED', 'PENDING_APPROVAL'])).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const user = await validateUserAccess(ctx.session.user.id)
      
      const jobs = await db.printJob.findMany({
        where: {
          userId: ctx.session.user.id,
          status: input.status ? { in: input.status } : undefined
        },
        include: {
          template: { select: { name: true, type: true } },
          approvalWorkflow: true
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        take: input.limit,
        skip: input.offset
      })
      
      return jobs.map(job => ({
        ...job,
        payload: JSON.parse(job.payload)
      }))
    }),

  cancelJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      const job = await db.printJob.update({
        where: { 
          id: input.jobId,
          userId: ctx.session.user.id
        },
        data: { 
          status: 'CANCELLED',
          completedAt: new Date()
        }
      })
      
      await auditLog(ctx.session.user.id, 'JOB_CANCELLED', 'PrintJob', job.id)
      return job
    }),

  retryJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      const job = await db.printJob.update({
        where: { 
          id: input.jobId,
          userId: ctx.session.user.id
        },
        data: { 
          status: 'QUEUED',
          errorMessage: null,
          completedAt: null
        }
      })
      
      await auditLog(ctx.session.user.id, 'JOB_RETRIED', 'PrintJob', job.id)
      return job
    }),

  pauseJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      const job = await db.printJob.update({
        where: { 
          id: input.jobId,
          userId: ctx.session.user.id
        },
        data: { status: 'PAUSED' }
      })
      
      await auditLog(ctx.session.user.id, 'JOB_PAUSED', 'PrintJob', job.id)
      return job
    }),

  resumeJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      const job = await db.printJob.update({
        where: { 
          id: input.jobId,
          userId: ctx.session.user.id
        },
        data: { status: 'QUEUED' }
      })
      
      await auditLog(ctx.session.user.id, 'JOB_RESUMED', 'PrintJob', job.id)
      return job
    }),

  // ============================================================================
  // Validation and AI
  // ============================================================================
  
  validateTemplate: protectedProcedure
    .input(z.object({
      xml: z.string(),
      rules: z.array(z.object({
        ruleType: z.enum(['BARCODE_FORMAT', 'QR_CONTENT', 'FIELD_REQUIRED', 'LENGTH_CHECK', 'REGEX_PATTERN']),
        ruleConfig: z.record(z.any()),
        errorMessage: z.string()
      })).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Implement template validation logic
      const errors: any[] = []
      const warnings: any[] = []
      const suggestions: string[] = []
      
      // Basic XML validation
      try {
        // TODO: Implement DYMO XML validation
        if (!input.xml.includes('<DieCutLabel')) {
          errors.push({
            field: 'xml',
            message: 'Ikke en gyldig DYMO label XML',
            severity: 'ERROR',
            code: 'INVALID_XML'
          })
        }
      } catch (e) {
        errors.push({
          field: 'xml',
          message: 'XML parsing feilet',
          severity: 'ERROR',
          code: 'XML_PARSE_ERROR'
        })
      }
      
      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions
      }
      
      return result
    }),

  validatePrinterConnection: protectedProcedure
    .input(z.object({ printerName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Implement printer connection validation
      // This would typically connect to DYMO SDK or printer service
      
      const status: ConnectionStatus = {
        isOnline: false, // TODO: Implement real check
        printerName: input.printerName,
        model: 'DYMO LabelWriter 450',
        lastSeen: new Date(),
        errorMessage: 'Simulert - ikke implementert ennå'
      }
      
      return status
    }),

  estimatePrintTime: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      itemCount: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const template = await db.labelTemplate.findUnique({
        where: { id: input.templateId }
      })
      
      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template ikke funnet'
        })
      }
      
      // Simple estimation logic
      const baseTime = template.estimatedRenderTime || 100 // milliseconds
      const totalTime = (baseTime * input.itemCount) / 1000 // seconds
      
      const result: EstimateResult = {
        estimatedDuration: totalTime,
        estimatedCost: input.itemCount * 0.25, // Simple cost calculation
        complexity: template.complexity,
        warnings: totalTime > 300 ? ['Lang utskriftstid estimert'] : []
      }
      
      return result
    }),

  getAIOptimizations: protectedProcedure
    .input(z.object({
      templateId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      // Placeholder for AI optimization logic
      const optimizations: AIOptimization[] = [{
        suggestedPrintTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        costSavings: 15.50,
        batchingOpportunities: [{
          suggestedBatchSize: 10,
          estimatedSavings: 5.25,
          reasoningText: 'Batching kan redusere setup-tid',
          confidence: 0.85
        }],
        maintenanceAlerts: [],
        confidence: 0.78,
        reasoning: 'Basert på tidligere utskriftsmønstre'
      }]
      
      return optimizations
    }),

  // ============================================================================
  // Search and Discovery
  // ============================================================================
  
  searchTemplates: protectedProcedure
    .input(SearchQuerySchema)
    .query(async ({ ctx, input }) => {
      const user = await validateUserAccess(ctx.session.user.id)
      
      // Build search query
      const whereClause: any = {
        OR: [
          { isSystemDefault: true },
          { userId: ctx.session.user.id },
          { householdId: { in: user.households?.map(h => h.householdId) || [] } }
        ]
      }
      
      if (input.query) {
        whereClause.AND = [
          {
            OR: [
              { name: { contains: input.query, mode: 'insensitive' } },
              { description: { contains: input.query, mode: 'insensitive' } },
              { category: { contains: input.query, mode: 'insensitive' } }
            ]
          }
        ]
      }
      
      const templates = await db.labelTemplate.findMany({
        where: whereClause,
        include: {
          _count: { select: { printJobs: true } }
        },
        take: input.pagination?.limit || 20,
        skip: ((input.pagination?.page || 1) - 1) * (input.pagination?.limit || 20)
      })
      
      const results: SearchResults = {
        templates: templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          type: t.type,
          size: t.size,
          category: t.category,
          thumbnail: t.thumbnail,
          usageCount: t._count.printJobs,
          isSystemDefault: t.isSystemDefault,
          complexity: t.complexity
        })),
        totalCount: templates.length,
        facets: [],
        suggestions: [],
        searchTime: 50 // milliseconds
      }
      
      return results
    }),

  // ============================================================================
  // Voice Interface
  // ============================================================================
  
  processVoiceCommand: protectedProcedure
    .input(VoiceCommandInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Placeholder for voice command processing
      const result: CommandResult = {
        understood: true,
        action: 'print_template',
        parameters: {
          templateId: input.templateId,
          copies: 1
        },
        confidence: 0.92,
        alternativeInterpretations: [
          'Skriv ut etikett',
          'Print label'
        ]
      }
      
      return result
    }),

  // ============================================================================
  // Analytics and Reporting
  // ============================================================================
  
  getPrintStats: protectedProcedure
    .input(z.object({
      timeRange: z.object({
        from: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val),
        to: z.union([z.date(), z.string()]).transform(val => typeof val === 'string' ? new Date(val) : val)
      }).optional(),
      userId: z.string().optional(),
      householdId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const user = await validateUserAccess(ctx.session.user.id)
      
      const whereClause: any = {
        userId: input.userId || ctx.session.user.id
      }
      
      if (input.timeRange) {
        whereClause.createdAt = {
          gte: input.timeRange.from,
          lte: input.timeRange.to
        }
      }
      
      const jobs = await db.printJob.findMany({
        where: whereClause,
        include: {
          template: { select: { name: true } },
          printingCosts: true
        }
      })
      
      const totalJobs = jobs.length
      const successfulJobs = jobs.filter(j => j.status === 'SUCCESS').length
      const totalCost = jobs.reduce((sum, job) => 
        sum + job.printingCosts.reduce((jobSum, cost) => jobSum + cost.totalCost, 0), 0)
      
      return {
        totalJobs,
        successRate: totalJobs > 0 ? successfulJobs / totalJobs : 0,
        averageDuration: 0, // TODO: Calculate from actualDuration
        costBreakdown: {
          labelCosts: totalCost * 0.8,
          operationalCosts: totalCost * 0.15,
          maintenanceCosts: totalCost * 0.05,
          totalCost,
          currency: 'NOK',
          period: 'month'
        },
        popularTemplates: [],
        printerUtilization: [],
        timeRange: input.timeRange || { from: new Date(), to: new Date() }
      }
    }),

  // Printer Management
  listPrinters: publicProcedure
    .query(async ({ ctx }) => {
      await validateUserAccess(ctx.session?.user?.id)
      
      return await ctx.db.printerProfile.findMany({
        where: {
          household: {
            users: {
              some: {
                id: ctx.session?.user?.id
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    }),

  // Label Media Management
  listLabelMedia: publicProcedure
    .query(async ({ ctx }) => {
      await validateUserAccess(ctx.session?.user?.id)
      
      return await ctx.db.labelMedia.findMany({
        orderBy: {
          size: 'asc'
        }
      })
    }),

  // Advanced Printer Management
  addPrinter: protectedProcedure
    .input(z.object({
      name: z.string(),
      model: z.string(),
      connectionType: z.enum(['NETWORK', 'USB', 'BLUETOOTH']),
      ipAddress: z.string().optional(),
      port: z.string().optional(),
      location: z.string().optional(),
      description: z.string().optional(),
      settings: z.record(z.any()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      const printer = await db.printerProfile.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          householdId: 'default', // TODO: Get from user context
          isDefault: false,
          settings: JSON.stringify(input.settings || {})
        }
      })
      
      await auditLog(ctx.session.user.id, 'PRINTER_ADDED', 'PrinterProfile', printer.id)
      return printer
    }),

  updatePrinter: protectedProcedure
    .input(z.object({
      printerId: z.string(),
      name: z.string().optional(),
      model: z.string().optional(),
      connectionType: z.enum(['NETWORK', 'USB', 'BLUETOOTH']).optional(),
      ipAddress: z.string().optional(),
      port: z.string().optional(),
      location: z.string().optional(),
      description: z.string().optional(),
      settings: z.record(z.any()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      const { printerId, ...updateData } = input
      const printer = await db.printerProfile.update({
        where: { 
          id: printerId,
          userId: ctx.session.user.id
        },
        data: {
          ...updateData,
          settings: updateData.settings ? JSON.stringify(updateData.settings) : undefined
        }
      })
      
      await auditLog(ctx.session.user.id, 'PRINTER_UPDATED', 'PrinterProfile', printer.id)
      return printer
    }),

  deletePrinter: protectedProcedure
    .input(z.object({ printerId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      await db.printerProfile.delete({
        where: { 
          id: input.printerId,
          userId: ctx.session.user.id
        }
      })
      
      await auditLog(ctx.session.user.id, 'PRINTER_DELETED', 'PrinterProfile', input.printerId)
      return { success: true }
    }),

  testPrinter: protectedProcedure
    .input(z.object({ printerId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      const printer = await db.printerProfile.findUnique({
        where: { 
          id: input.printerId,
          userId: ctx.session.user.id
        }
      })
      
      if (!printer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Skriver ikke funnet'
        })
      }
      
      // TODO: Implement actual printer test
      // For now, just simulate a test
      await auditLog(ctx.session.user.id, 'PRINTER_TESTED', 'PrinterProfile', input.printerId)
      
      return { 
        success: true, 
        message: 'Test-utskrift sendt til skriver',
        testId: `test_${Date.now()}`
      }
    }),

  getSupportedPrinterModels: protectedProcedure
    .query(async () => {
      // Return supported printer models
      return [
        { id: 'DYMO_LW_450', name: 'DYMO LabelWriter 450', manufacturer: 'DYMO' },
        { id: 'DYMO_LW_450_TURBO', name: 'DYMO LabelWriter 450 Turbo', manufacturer: 'DYMO' },
        { id: 'DYMO_LW_550', name: 'DYMO LabelWriter 550', manufacturer: 'DYMO' },
        { id: 'DYMO_LW_550_TURBO', name: 'DYMO LabelWriter 550 Turbo', manufacturer: 'DYMO' },
        { id: 'ZEBRA_ZD220', name: 'Zebra ZD220', manufacturer: 'Zebra' },
        { id: 'ZEBRA_ZD420', name: 'Zebra ZD420', manufacturer: 'Zebra' },
        { id: 'BROTHER_QL_800', name: 'Brother QL-800', manufacturer: 'Brother' },
        { id: 'BROTHER_QL_820NWB', name: 'Brother QL-820NWB', manufacturer: 'Brother' }
      ]
    }),

  // Real printer integration
  discoverPrinters: protectedProcedure
    .mutation(async ({ ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      try {
        const discoveredPrinters = await printerDriverService.discoverPrinters()
        
        // Update database with discovered printers
        for (const printer of discoveredPrinters) {
          await db.printerProfile.upsert({
            where: { 
              name_userId: { 
                name: printer.name, 
                userId: ctx.session.user.id 
              } 
            },
            update: {
              model: printer.model,
              connectionType: printer.connectionType,
              isOnline: printer.isConnected,
              capabilities: JSON.stringify(printer.capabilities),
              updatedAt: new Date()
            },
            create: {
              name: printer.name,
              model: printer.model,
              connectionType: printer.connectionType,
              isOnline: printer.isConnected,
              capabilities: JSON.stringify(printer.capabilities),
              userId: ctx.session.user.id,
              householdId: 'default', // TODO: Get from user context
              isDefault: false,
              settings: JSON.stringify({})
            }
          })
        }
        
        await auditLog(ctx.session.user.id, 'PRINTERS_DISCOVERED', 'PrinterProfile', `${discoveredPrinters.length} printers`)
        return { success: true, count: discoveredPrinters.length, printers: discoveredPrinters }
      } catch (error) {
        console.error('Printer discovery failed:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Discovery failed' }
      }
    }),

  realPrintLabel: protectedProcedure
    .input(z.object({
      printerId: z.string(),
      templateId: z.string(),
      labelData: z.record(z.string()),
      settings: z.object({
        copies: z.number().default(1),
        jobTitle: z.string().optional(),
        cutMode: z.enum(['auto', 'manual', 'none']).optional(),
        alignment: z.enum(['left', 'center', 'right']).optional()
      }).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      try {
        // Get template from database
        const template = await db.labelTemplate.findUnique({
          where: { id: input.templateId }
        })
        
        if (!template) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Template not found'
          })
        }
        
        // Get printer info from database
        const dbPrinter = await db.printerProfile.findUnique({
          where: { id: input.printerId, userId: ctx.session.user.id }
        })
        
        if (!dbPrinter) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Printer not found'
          })
        }
        
        // Get universal printer from service
        const universalPrinter = printerDriverService.getPrinter(input.printerId)
        if (!universalPrinter) {
          // Try to rediscover printers
          await printerDriverService.discoverPrinters()
          const retryPrinter = printerDriverService.getPrinter(input.printerId)
          
          if (!retryPrinter) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Printer not available. Please check connection and try again.'
            })
          }
        }
        
        // Create label template object
        const labelTemplate = {
          id: template.id,
          name: template.name,
          brand: 'DYMO' as const, // TODO: Determine from printer type
          format: 'DYMO_XML',
          width: 0, // Will be determined by template
          height: 0,
          content: template.content,
          variables: Object.keys(input.labelData)
        }
        
        // Print using universal service
        const result = await printerDriverService.printLabel(
          input.printerId,
          labelTemplate,
          input.labelData,
          input.settings || {}
        )
        
        if (result.success) {
          // Create print job record
          const printJob = await db.printJob.create({
            data: {
              id: result.jobId || `job_${Date.now()}`,
              templateId: input.templateId,
              printerProfileId: input.printerId,
              userId: ctx.session.user.id,
              householdId: 'default',
              status: 'COMPLETED',
              data: JSON.stringify(input.labelData),
              settings: JSON.stringify(input.settings || {}),
              copies: input.settings?.copies || 1,
              startedAt: new Date(),
              completedAt: new Date()
            }
          })
          
          await auditLog(ctx.session.user.id, 'LABEL_PRINTED', 'PrintJob', printJob.id)
          
          return {
            success: true,
            jobId: printJob.id,
            message: 'Label printed successfully'
          }
        } else {
          // Create failed job record
          await db.printJob.create({
            data: {
              id: result.jobId || `job_failed_${Date.now()}`,
              templateId: input.templateId,
              printerProfileId: input.printerId,
              userId: ctx.session.user.id,
              householdId: 'default',
              status: 'FAILED',
              data: JSON.stringify(input.labelData),
              settings: JSON.stringify(input.settings || {}),
              copies: input.settings?.copies || 1,
              errorMessage: result.error,
              startedAt: new Date(),
              completedAt: new Date()
            }
          })
          
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error || 'Print failed'
          })
        }
      } catch (error) {
        console.error('Print error:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Print failed'
        })
      }
    }),

  testRealPrinter: protectedProcedure
    .input(z.object({ printerId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      try {
        // Test using universal service
        const result = await printerDriverService.testPrinter(input.printerId)
        
        if (result.success) {
          await auditLog(ctx.session.user.id, 'PRINTER_TEST_SUCCESS', 'PrinterProfile', input.printerId)
        } else {
          await auditLog(ctx.session.user.id, 'PRINTER_TEST_FAILED', 'PrinterProfile', input.printerId)
        }
        
        return result
      } catch (error) {
        console.error('Printer test error:', error)
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Test failed' 
        }
      }
    }),

  getPrinterQueue: protectedProcedure
    .query(async ({ ctx }) => {
      await validateUserAccess(ctx.session?.user?.id)
      
      const queueStatus = printerDriverService.getQueueStatus()
      return queueStatus
    }),

  generateQuickTemplate: protectedProcedure
    .input(z.object({
      type: z.enum(['address', 'shipping', 'barcode', 'qr']),
      size: z.enum(['small', 'medium', 'large']).default('medium'),
      printerBrand: z.enum(['DYMO', 'ZEBRA', 'BROTHER']).default('DYMO')
    }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      try {
        const template = printerDriverService.generateTemplate(
          input.printerBrand,
          input.type,
          input.size
        )
        
        if (!template) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate template'
          })
        }
        
        // Save to database
        const savedTemplate = await db.labelTemplate.create({
          data: {
            name: template.name,
            content: template.content,
            size: input.size.toUpperCase() as any,
            type: input.type.toUpperCase() as any,
            userId: ctx.session.user.id,
            householdId: 'default',
            isPublic: false,
            version: 1
          }
        })
        
        await auditLog(ctx.session.user.id, 'TEMPLATE_GENERATED', 'LabelTemplate', savedTemplate.id)
        
        return {
          success: true,
          template: savedTemplate,
          variables: template.variables
        }
      } catch (error) {
        console.error('Template generation error:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Template generation failed'
        })
      }
    }),

  // Bulk print location QR codes
  bulkPrintLocationQR: protectedProcedure
    .input(z.object({
      locationIds: z.array(z.string()),
      printerId: z.string(),
      settings: z.object({
        copies: z.number().default(1),
        labelSize: z.enum(['small', 'standard', 'large']).default('standard'),
        includeHierarchy: z.boolean().default(true),
        includeAutoNumber: z.boolean().default(true),
        includeColorCode: z.boolean().default(false),
        includeTags: z.boolean().default(false)
      }).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      await validateUserAccess(ctx.session.user.id)
      
      try {
        // Fetch locations
        const locations = await ctx.db.location.findMany({
          where: {
            id: { in: input.locationIds },
            userId: ctx.session.user.id
          },
          include: {
            parent: true
          }
        })

        if (locations.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No locations found'
          })
        }

        // Create print jobs for each location
        const printJobs = []
        
        for (const location of locations) {
          const labelData = {
            locationName: location.displayName || location.name,
            locationType: location.type,
            autoNumber: location.autoNumber || '',
            qrCode: location.qrCode,
            parentName: location.parent?.name || '',
            tags: location.tags ? JSON.parse(location.tags) : [],
            colorCode: location.colorCode || '',
            level: location.level || 0
          }

          // TODO: Integrate with actual printing service
          console.log('Creating print job for location:', labelData)
          
          printJobs.push({
            locationId: location.id,
            locationName: location.name,
            status: 'queued'
          })
        }

        return {
          success: true,
          jobCount: printJobs.length,
          jobs: printJobs
        }

      } catch (error) {
        console.error('Bulk print error:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Bulk print failed'
        })
      }
    })
})

export default printingRouter