// ============================================================================
// PRINTING SYSTEM - DYMO LabelWriter and Printer Management
// ============================================================================

import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'
import { PrinterBrand, ConnectionType, PrinterStatus, PrintJobType, JobStatus } from '@prisma/client'

// Input schemas
const createPrinterSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  model: z.string().min(1, "Modell er påkrevd"),
  brand: z.nativeEnum(PrinterBrand).optional().default('DYMO'),
  connectionType: z.nativeEnum(ConnectionType).optional().default('NETWORK'),
  ipAddress: z.string().optional(),
  port: z.string().optional().default('9100'),
  location: z.string().optional(),
  description: z.string().optional(),
})

const updatePrinterSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  model: z.string().optional(),
  connectionType: z.nativeEnum(ConnectionType).optional(),
  ipAddress: z.string().optional(),
  port: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
})

const createPrintJobSchema = z.object({
  title: z.string(),
  type: z.nativeEnum(PrintJobType).optional().default('LABEL'),
  printerId: z.string(),
  labelXml: z.string().optional(),
  labelData: z.record(z.string()).optional(),
  settings: z.record(z.any()).optional(),
  itemId: z.string().optional(),
  locationId: z.string().optional(),
})

export const printingRouter = createTRPCRouter({
  // Get all printers for current user
  listPrinters: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const printers = await ctx.db.printer.findMany({
          where: { userId: ctx.session.user.id },
          include: {
            printJobs: {
              where: { status: 'PENDING' },
              select: { id: true }
            }
          },
          orderBy: { isDefault: 'desc' }
        })

        return printers.map(printer => ({
          ...printer,
          queuedJobs: printer.printJobs.length
        }))
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch printers'
        })
      }
    }),

  // Add new printer
  addPrinter: protectedProcedure
    .input(createPrinterSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get printer capabilities based on model
        const capabilities = getPrinterCapabilities(input.model)
        
        const printer = await ctx.db.printer.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
            maxWidth: capabilities.maxWidth,
            resolution: capabilities.resolution,
            supportedMedia: capabilities.supportedMedia,
            status: 'UNKNOWN',
          }
        })

        return printer
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add printer'
        })
      }
    }),

  // Update printer
  updatePrinter: protectedProcedure
    .input(updatePrinterSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      
      try {
        const printer = await ctx.db.printer.update({
          where: { 
            id,
            userId: ctx.session.user.id // Ensure user owns the printer
          },
          data: updateData
        })

        return printer
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update printer'
        })
      }
    }),

  // Delete printer
  deletePrinter: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.printer.delete({
          where: { 
            id: input.id,
            userId: ctx.session.user.id // Ensure user owns the printer
          }
        })

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete printer'
        })
      }
    }),

  // Test printer connection
  testPrinter: protectedProcedure
    .input(z.object({ printerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const printer = await ctx.db.printer.findFirst({
          where: {
            id: input.printerId,
            userId: ctx.session.user.id
          }
        })

        if (!printer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Printer not found'
          })
        }

        // Update last seen timestamp
        await ctx.db.printer.update({
          where: { id: printer.id },
          data: { 
            lastSeen: new Date(),
            status: 'ONLINE'
          }
        })

        return { success: true, message: 'Test successful' }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Printer test failed'
        })
      }
    }),

  // Get supported printer models
  getSupportedPrinterModels: protectedProcedure
    .query(async () => {
      return getSupportedPrinterModels()
    }),

  // Create print job
  createPrintJob: protectedProcedure
    .input(createPrintJobSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const printJob = await ctx.db.printJob.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
          }
        })

        return printJob
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create print job'
        })
      }
    }),
})

// Helper functions
function getPrinterCapabilities(model: string) {
  const capabilities: Record<string, any> = {
    'DYMO_LW_450': {
      maxWidth: 2.3,
      resolution: 600,
      supportedMedia: ['Address', 'Shipping', 'File Folder', 'Name Badge']
    },
    'DYMO_LW_450_TURBO': {
      maxWidth: 2.3,
      resolution: 600,
      supportedMedia: ['Address', 'Shipping', 'File Folder', 'Name Badge']
    },
    'DYMO_LW_550': {
      maxWidth: 2.3,
      resolution: 600,
      supportedMedia: ['Address', 'Shipping', 'File Folder', 'Name Badge', 'CD/DVD']
    },
    'DYMO_LW_550_TURBO': {
      maxWidth: 2.3,
      resolution: 600,
      supportedMedia: ['Address', 'Shipping', 'File Folder', 'Name Badge', 'CD/DVD']
    },
    'DYMO_LW_WIRELESS': {
      maxWidth: 2.3,
      resolution: 600,
      supportedMedia: ['Address', 'Shipping', 'File Folder', 'Name Badge', 'CD/DVD', 'QR Code']
    },
    'DYMO_LW_4XL': {
      maxWidth: 4.16,
      resolution: 300,
      supportedMedia: ['Large Address', 'Large Shipping', '4x6 Photo']
    }
  }
  
  return capabilities[model] || {
    maxWidth: 2.3,
    resolution: 600,
    supportedMedia: ['Address', 'Shipping']
  }
}

function getSupportedPrinterModels() {
  return [
    { 
      value: 'DYMO_LW_450', 
      label: 'DYMO LabelWriter 450',
      brand: 'DYMO',
      wireless: false
    },
    { 
      value: 'DYMO_LW_450_TURBO', 
      label: 'DYMO LabelWriter 450 Turbo',
      brand: 'DYMO',
      wireless: false
    },
    { 
      value: 'DYMO_LW_550', 
      label: 'DYMO LabelWriter 550',
      brand: 'DYMO',
      wireless: false
    },
    { 
      value: 'DYMO_LW_550_TURBO', 
      label: 'DYMO LabelWriter 550 Turbo',
      brand: 'DYMO',
      wireless: false
    },
    { 
      value: 'DYMO_LW_WIRELESS', 
      label: 'DYMO LabelWriter Wireless',
      brand: 'DYMO',
      wireless: true
    },
    { 
      value: 'ZEBRA_ZD220', 
      label: 'Zebra ZD220',
      brand: 'ZEBRA',
      wireless: false
    },
    { 
      value: 'ZEBRA_ZD420', 
      label: 'Zebra ZD420',
      brand: 'ZEBRA',
      wireless: true
    },
    { 
      value: 'BROTHER_QL_800', 
      label: 'Brother QL-800',
      brand: 'BROTHER',
      wireless: false
    },
    { 
      value: 'BROTHER_QL_820NWB', 
      label: 'Brother QL-820NWB',
      brand: 'BROTHER',
      wireless: true
    }
  ]
}
