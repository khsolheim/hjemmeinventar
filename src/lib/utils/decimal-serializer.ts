import { Decimal } from '@prisma/client/runtime/library'

/**
 * Converts Prisma Decimal objects to numbers for client serialization
 */
export function serializeDecimal(value: Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null
  return typeof value === 'object' && 'toNumber' in value ? value.toNumber() : Number(value)
}

/**
 * Recursively converts all Decimal fields in an object to numbers
 */
export function serializeItemForClient<T extends Record<string, any>>(item: T): T {
  if (!item) return item
  
  const serialized = { ...item }
  
  // Convert known Decimal fields
  if ('availableQuantity' in serialized && (serialized as any).availableQuantity !== undefined) {
    (serialized as any).availableQuantity = serializeDecimal((serialized as any).availableQuantity)
  }
  if ('consumedQuantity' in serialized && (serialized as any).consumedQuantity !== undefined) {
    (serialized as any).consumedQuantity = serializeDecimal((serialized as any).consumedQuantity)
  }
  if ('price' in serialized && (serialized as any).price !== undefined) {
    (serialized as any).price = serializeDecimal((serialized as any).price)
  }
  
  return serialized
}

/**
 * Converts array of Items with Decimal fields to serializable format
 */
export function serializeItemsForClient<T extends Record<string, any>>(items: T[]): T[] {
  return items.map(serializeItemForClient)
}
