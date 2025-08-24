// Database connection og utilities
import { PrismaClient, ActivityType } from '@prisma/client'

// PrismaClient singleton pattern for Next.js
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Database utilities
export async function generateUniqueQRCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let qrCode: string
  let exists: boolean
  
  do {
    qrCode = Array.from({ length: 8 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
    
    const [loc, dist] = await Promise.all([
      db.location.findUnique({ where: { qrCode } }),
      db.itemDistribution.findFirst({ where: { id: `D-${qrCode}` } })
    ])
    exists = !!loc || !!dist
  } while (exists)
  
  return qrCode
}

// Item quantity helpers
export function calculateAvailableQuantity(
  totalQuantity: number,
  consumedQuantity: number
): number {
  return Math.max(0, totalQuantity - consumedQuantity)
}

export function validateQuantityUpdate(
  currentTotal: number,
  newConsumed: number
): boolean {
  return newConsumed >= 0 && newConsumed <= currentTotal
}

// Search helpers
export function buildSearchQuery(query: string) {
  const words = query.toLowerCase().split(' ').filter(Boolean)
  return {
    OR: [
      { name: { contains: query } },
      { description: { contains: query } },
      { brand: { contains: query } },
      ...words.map(word => ({
        name: { contains: word }
      }))
    ]
  }
}

// Activity logging helper
export async function logActivity({
  type,
  description,
  userId,
  itemId,
  locationId,
  metadata
}: {
  type: ActivityType
  description: string
  userId: string
  itemId?: string
  locationId?: string
  metadata?: Record<string, unknown>
}) {
  return await db.activity.create({
    data: {
      type,
      description,
      userId,
      itemId,
      locationId,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    }
  })
}

// Transaction helper for complex operations
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return await db.$transaction(fn)
}
