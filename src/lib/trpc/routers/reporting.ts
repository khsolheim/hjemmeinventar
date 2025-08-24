import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const reportingRouter = createTRPCRouter({
  // Get dashboards
  getDashboards: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's dashboards
        const dashboards = await ctx.db.dashboard.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })

        const activeDashboards = dashboards.filter(dashboard => dashboard.isActive).length

        return {
          activeDashboards,
          dashboards: dashboards.map(dashboard => ({
            id: dashboard.id,
            name: dashboard.name,
            description: dashboard.description,
            widgets: dashboard.widgets,
            isPublic: dashboard.isPublic,
            isActive: dashboard.isActive,
            lastUpdated: dashboard.updatedAt,
            layout: dashboard.layout,
            filters: dashboard.filters
          }))
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente dashboards'
        })
      }
    }),

  // Get reports
  getReports: protectedProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d', '1y'])
    }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Get user's reports
        const reports = await ctx.db.report.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })

        const totalReports = reports.length

        return {
          totalReports,
          reports: reports.map(report => ({
            id: report.id,
            name: report.name,
            type: report.type,
            format: report.format,
            size: report.size,
            status: report.status,
            createdAt: report.createdAt,
            metadata: report.metadata
          }))
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente rapporter'
        })
      }
    }),

  // Get analytics
  getAnalytics: protectedProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d', '1y'])
    }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Get analytics data
        const analytics = [
          {
            id: 'user-activity',
            name: 'User Activity',
            value: '1,234',
            percentage: 85,
            trend: 12
          },
          {
            id: 'data-usage',
            name: 'Data Usage',
            value: '2.3 TB',
            percentage: 65,
            trend: -5
          },
          {
            id: 'api-calls',
            name: 'API Calls',
            value: '45,678',
            percentage: 92,
            trend: 8
          },
          {
            id: 'storage-usage',
            name: 'Storage Usage',
            value: '1.8 TB',
            percentage: 78,
            trend: 15
          },
          {
            id: 'response-time',
            name: 'Response Time',
            value: '45ms',
            percentage: 88,
            trend: -3
          },
          {
            id: 'uptime',
            name: 'Uptime',
            value: '99.9%',
            percentage: 99,
            trend: 0
          }
        ]

        const totalDataPoints = analytics.reduce((total, analytic) => {
          const value = parseInt(analytic.value.replace(/[^\d]/g, '')) || 0
          return total + value
        }, 0)

        return {
          totalDataPoints,
          analytics
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente analytics data'
        })
      }
    }),

  // Get insights
  getInsights: protectedProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d', '1y'])
    }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Get AI-generated insights
        const insights = [
          {
            id: 'insight-1',
            title: 'Høy brukeraktivitet på kvelden',
            description: 'Brukere er mest aktive mellom 18:00-22:00. Vurder å optimalisere for denne tidsperioden.',
            priority: 'high',
            confidence: 95,
            generatedAt: '2024-01-15 14:30'
          },
          {
            id: 'insight-2',
            title: 'API response time forbedring',
            description: 'Response time har forbedret seg med 15% siste uken. Fortsett med optimalisering.',
            priority: 'medium',
            confidence: 87,
            generatedAt: '2024-01-15 12:15'
          },
          {
            id: 'insight-3',
            title: 'Lav lagringsbruk',
            description: 'Lagringsbruk er under 70%. Du kan spare penger ved å redusere lagring.',
            priority: 'low',
            confidence: 92,
            generatedAt: '2024-01-15 10:45'
          },
          {
            id: 'insight-4',
            title: 'Mobil bruk øker',
            description: 'Mobil bruk har økt med 25% siste måneden. Vurder å optimalisere mobile features.',
            priority: 'high',
            confidence: 89,
            generatedAt: '2024-01-15 09:20'
          },
          {
            id: 'insight-5',
            title: 'Database performance optimal',
            description: 'Database performance er optimal. Ingen handlinger kreves.',
            priority: 'low',
            confidence: 96,
            generatedAt: '2024-01-15 08:30'
          }
        ]

        const totalInsights = insights.length

        return {
          totalInsights,
          insights
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente insights'
        })
      }
    }),

  // Create report
  createReport: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.string(),
      format: z.string(),
      filters: z.any()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Create report
        const report = await ctx.db.report.create({
          data: {
            userId,
            name: input.name,
            type: input.type,
            format: input.format,
            size: '0 KB',
            status: 'processing',
            metadata: {
              filters: input.filters,
              createdAt: new Date()
            }
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'REPORT_CREATED',
            description: `Opprettet rapport: ${input.name}`,
            userId,
            metadata: {
              reportId: report.id,
              reportName: input.name,
              reportType: input.type,
              reportFormat: input.format
            }
          }
        })

        return report
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette rapport'
        })
      }
    }),

  // Export data
  exportData: protectedProcedure
    .input(z.object({
      format: z.string(),
      timeRange: z.enum(['7d', '30d', '90d', '1y'])
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Simulate data export
        const exportResult = {
          success: true,
          format: input.format,
          timeRange: input.timeRange,
          dataSize: '2.3 MB',
          downloadUrl: `/api/export/${Date.now()}.${input.format}`,
          timestamp: new Date()
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'DATA_EXPORTED',
            description: `Eksporterte data i ${input.format} format`,
            userId,
            metadata: {
              format: input.format,
              timeRange: input.timeRange,
              dataSize: exportResult.dataSize
            }
          }
        })

        return exportResult
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke eksportere data'
        })
      }
    }),

  // Share report
  shareReport: protectedProcedure
    .input(z.object({
      reportId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Get report
        const report = await ctx.db.report.findFirst({
          where: {
            id: input.reportId,
            userId
          }
        })

        if (!report) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Rapport ikke funnet'
          })
        }

        // Generate share link
        const shareResult = {
          success: true,
          reportId: input.reportId,
          shareUrl: `/shared/report/${input.reportId}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          timestamp: new Date()
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'REPORT_SHARED',
            description: `Delte rapport: ${report.name}`,
            userId,
            metadata: {
              reportId: input.reportId,
              reportName: report.name,
              shareUrl: shareResult.shareUrl
            }
          }
        })

        return shareResult
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke dele rapport'
        })
      }
    }),

  // Get reporting statistics
  getReportingStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get reporting statistics
        const [dashboards, reports, exports, shares] = await Promise.all([
          ctx.db.dashboard.count({ where: { userId } }),
          ctx.db.report.count({ where: { userId } }),
          ctx.db.activity.count({ 
            where: { 
              userId,
              type: 'DATA_EXPORTED'
            }
          }),
          ctx.db.activity.count({ 
            where: { 
              userId,
              type: 'REPORT_SHARED'
            }
          })
        ])

        return {
          totalDashboards: dashboards,
          totalReports: reports,
          totalExports: exports,
          totalShares: shares
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente reporting statistikk'
        })
      }
    })
})
