import { z } from 'zod'

// Garn Master – felles data for en garntype
export const GarnMasterSchema = z.object({
  producer: z.string().min(1, 'Produsent er påkrevd').optional(),
  composition: z.string().min(1, 'Sammensetning er påkrevd').optional(),
  yardage: z.string().optional(),
  weight: z.string().optional(),
  gauge: z.string().optional(),
  needleSize: z.string().optional(),
  careInstructions: z.string().optional(),
  store: z.string().optional(),
  notes: z.string().optional()
})

export type GarnMaster = z.infer<typeof GarnMasterSchema>

// Garn Farge – nivå mellom master og batch
export const GarnColorSchema = z.object({
  colorCode: z.string().optional(),
  masterItemId: z.string()
})

export type GarnColor = z.infer<typeof GarnColorSchema>

// Garn Batch – unike data for en batch/nøster
export const GarnBatchSchema = z.object({
  batchNumber: z.string().min(1, 'Batch nummer er påkrevd'),
  color: z.string().min(1, 'Farge er påkrevd'),
  colorCode: z.string().optional(),
  quantity: z.number().min(1, 'Antall må være minst 1'),
  pricePerSkein: z.number().min(0).optional(),
  purchaseDate: z.date().optional(),
  condition: z.string().optional(),
  masterItemId: z.string(),
  notes: z.string().optional()
})

export type GarnBatch = z.infer<typeof GarnBatchSchema>
