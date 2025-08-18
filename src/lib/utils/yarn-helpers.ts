// Hjelpefunksjoner for Yarn Master/Batch system
import { type PrismaClient, RelationType } from '@prisma/client'

export interface YarnMasterData {
  producer?: string
  composition?: string
  yardage?: string
  weight?: string
  gauge?: string
  needleSize?: string
  careInstructions?: string
  store?: string
  notes?: string
}

export interface YarnBatchData {
  batchNumber: string
  color: string
  colorCode?: string
  quantity: number
  pricePerSkein?: number
  purchaseDate?: Date
  condition?: string
  masterItemId?: string
  notes?: string
}

/**
 * Hjelper for å identifisere om et item er en Garn Master
 */
export function isYarnMaster(categoryName?: string): boolean {
  return categoryName === 'Garn Master'
}

/**
 * Hjelper for å identifisere om et item er en Garn Batch
 */
export function isYarnBatch(categoryName?: string): boolean {
  return categoryName === 'Garn Batch'
}

/**
 * Henter alle batch items som tilhører en master
 */
export async function getBatchesForMaster(
  db: PrismaClient,
  masterId: string,
  userId: string
) {
  // Forsøk typed relasjoner først
  const typedLinks = await db.itemRelation.findMany({
    where: { userId, relationType: RelationType.MASTER_OF, fromItemId: masterId },
    select: { toItemId: true }
  })

  let batchIds = typedLinks.map(l => l.toItemId)

  if (batchIds.length === 0) {
    // Fallback til legacy relasjoner
    const batchCategory = await db.category.findFirst({ where: { name: 'Garn Batch' } })
    if (!batchCategory) return []

    const legacy = await db.item.findMany({
      where: {
        userId,
        categoryId: batchCategory.id,
        relatedItems: { some: { id: masterId } }
      },
      select: { id: true }
    })
    batchIds = legacy.map(b => b.id)

    // Fallback #2: categoryData masterItemId
    if (batchIds.length === 0) {
      const legacyData = await db.item.findMany({
        where: {
          userId,
          categoryId: batchCategory.id,
          categoryData: { contains: `"masterItemId":"${masterId}"` }
        },
        select: { id: true }
      })
      batchIds = legacyData.map(b => b.id)
    }
  }

  if (batchIds.length === 0) return []

  const batches = await db.item.findMany({
    where: { id: { in: batchIds } },
    include: { location: true, tags: true, category: true },
    orderBy: [{ createdAt: 'desc' }]
  })

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] getBatchesForMaster(${masterId}): Found ${batches.length} batches (typed=${typedLinks.length > 0})`)
  }

  return batches
}

/**
 * Henter master item for en batch
 */
export async function getMasterForBatch(
  db: PrismaClient,
  batchId: string,
  userId: string
) {
  // Forsøk typed relasjon først
  const typed = await db.itemRelation.findFirst({
    where: { userId, relationType: RelationType.MASTER_OF, toItemId: batchId },
    select: { fromItemId: true }
  })
  if (typed?.fromItemId) {
    return await db.item.findFirst({ where: { id: typed.fromItemId, userId } })
  }

  // Fallback: legacy via relatedItems
  const batch = await db.item.findFirst({
    where: { id: batchId, userId },
    include: { relatedItems: { include: { category: true } } }
  })

  if (!batch) return null

  const master = batch.relatedItems.find(item => 
    isYarnMaster(item.category?.name)
  )

  return master || null
}

/**
 * Kobler batch til master via relatedItems
 */
export async function linkBatchToMaster(
  db: PrismaClient,
  batchId: string,
  masterId: string
) {
  return await db.item.update({
    where: { id: batchId },
    data: {
      relatedItems: {
        connect: { id: masterId }
      }
    }
  })
}

/**
 * Beregner total mengde for en master på tvers av alle batches
 */
export async function calculateMasterTotals(
  db: PrismaClient,
  masterId: string,
  userId: string
) {
  const batches = await getBatchesForMaster(db, masterId, userId)
  
  const totals = batches.reduce((acc, batch) => {
    const batchData = batch.categoryData ? JSON.parse(batch.categoryData) : {}
    const quantity = Number(batchData.quantity) || 0
    const pricePerSkein = Number(batchData.pricePerSkein) || 0
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] Batch ${batch.id}:`, {
        name: batch.name,
        categoryDataQuantity: quantity,
        availableQuantity: batch.availableQuantity,
        totalQuantity: batch.totalQuantity,
        categoryDataRaw: batch.categoryData
      })
    }
    
    return {
      totalSkeins: acc.totalSkeins + quantity,
      availableSkeins: acc.availableSkeins + (batch.availableQuantity || 0),
      totalValue: acc.totalValue + (quantity * pricePerSkein),
      batchCount: acc.batchCount + 1
    }
  }, {
    totalSkeins: 0,
    availableSkeins: 0,
    totalValue: 0,
    batchCount: 0
  })

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] Master ${masterId} totals:`, totals)
  }

  return totals
}

/**
 * Oppretter en ny batch knyttet til eksisterende master
 */
export async function createBatchForMaster(
  db: PrismaClient,
  masterId: string,
  batchData: YarnBatchData & {
    name: string
    locationId: string
    userId: string
    imageUrl?: string
    unit?: string
  }
) {
  // Finn batch-kategorien
  const batchCategory = await db.category.findFirst({
    where: { name: 'Garn Batch' }
  })

  if (!batchCategory) {
    throw new Error('Garn Batch kategori ikke funnet')
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] Creating batch with quantity:`, {
      inputQuantity: batchData.quantity,
      quantityType: typeof batchData.quantity,
      batchData: JSON.stringify({
        batchNumber: batchData.batchNumber,
        color: batchData.color,
        colorCode: batchData.colorCode,
        quantity: batchData.quantity,
        pricePerSkein: batchData.pricePerSkein,
        condition: batchData.condition || 'Ny',
        masterItemId: masterId,
        notes: batchData.notes
      })
    })
  }

  // Opprett batch item
  const batch = await db.item.create({
    data: {
      name: batchData.name,
      description: `Batch ${batchData.batchNumber} - ${batchData.color}`,
      userId: batchData.userId,
      categoryId: batchCategory.id,
      locationId: batchData.locationId,
      totalQuantity: Math.floor(batchData.quantity),
      availableQuantity: Number(batchData.quantity),
      unit: batchData.unit || 'nøste',
      price: batchData.pricePerSkein,
      purchaseDate: batchData.purchaseDate,
      imageUrl: batchData.imageUrl,
      categoryData: JSON.stringify({
        batchNumber: batchData.batchNumber,
        color: batchData.color,
        colorCode: batchData.colorCode,
        quantity: batchData.quantity,
        pricePerSkein: batchData.pricePerSkein,
        condition: batchData.condition || 'Ny',
        masterItemId: masterId,
        notes: batchData.notes
      }),
      relatedItems: {
        connect: { id: masterId }
      }
    },
    include: {
      category: true,
      location: true,
      relatedItems: true
    }
  })

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] Created batch:`, {
      id: batch.id,
      name: batch.name,
      totalQuantity: batch.totalQuantity,
      availableQuantity: batch.availableQuantity,
      categoryData: batch.categoryData
    })
  }

  // Typed relasjon master -> batch
  await db.itemRelation.create({
    data: {
      relationType: RelationType.MASTER_OF,
      fromItemId: masterId,
      toItemId: batch.id,
      userId: batchData.userId
    }
  })

  return batch
}

/**
 * Oppretter en ny master garn-type
 */
export async function createYarnMaster(
  db: PrismaClient,
  masterData: YarnMasterData & {
    name: string
    locationId?: string
    userId: string
    imageUrl?: string
  }
) {
  // Finn master-kategorien
  const masterCategory = await db.category.findFirst({
    where: { name: 'Garn Master' }
  })

  if (!masterCategory) {
    throw new Error('Garn Master kategori ikke funnet')
  }

  // Lag beskrivelse basert på tilgjengelige data
  const descriptionParts = []
  if (masterData.producer) descriptionParts.push(masterData.producer)
  if (masterData.composition) descriptionParts.push(masterData.composition)
  const description = descriptionParts.length > 0 ? descriptionParts.join(' - ') : 'Garn uten spesifisert type'

  // Hvis ingen lokasjon er angitt, bruk første tilgjengelige lokasjon
  let locationId = masterData.locationId
  if (!locationId) {
    const firstLocation = await db.location.findFirst({
      where: { userId: masterData.userId },
      orderBy: { name: 'asc' }
    })
    if (firstLocation) {
      locationId = firstLocation.id
    } else {
      throw new Error('Ingen lokasjoner tilgjengelige. Du må opprette minst én lokasjon før du kan registrere garn.')
    }
  }

  // Opprett master item
  const master = await db.item.create({
    data: {
      name: masterData.name,
      description,
      userId: masterData.userId,
      categoryId: masterCategory.id,
      locationId: locationId,
      totalQuantity: 0, // Master har ikke egen mengde
      availableQuantity: 0,
      unit: 'type',
      imageUrl: masterData.imageUrl,
      categoryData: JSON.stringify({
        producer: masterData.producer,
        composition: masterData.composition,
        yardage: masterData.yardage,
        weight: masterData.weight,
        gauge: masterData.gauge,
        needleSize: masterData.needleSize,
        careInstructions: masterData.careInstructions,
        store: masterData.store,
        notes: masterData.notes
      })
    },
    include: {
      category: true,
      location: true
    }
  })

  return master
}

/**
 * Sync felles data fra master til alle tilknyttede batches
 */
export async function syncMasterDataToBatches(
  db: PrismaClient,
  masterId: string,
  userId: string,
  updatedMasterData: Partial<YarnMasterData>
) {
  const batches = await getBatchesForMaster(db, masterId, userId)
  
  const updatePromises = batches.map(async (batch) => {
    const currentBatchData = batch.categoryData ? JSON.parse(batch.categoryData) : {}
    
    const updatedBatchData = {
      ...currentBatchData,
      ...(updatedMasterData.producer && { masterProducer: updatedMasterData.producer }),
      ...(updatedMasterData.composition && { masterComposition: updatedMasterData.composition }),
    }
    
    return db.item.update({
      where: { id: batch.id },
      data: {
        categoryData: JSON.stringify(updatedBatchData)
      }
    })
  })
  
  await Promise.all(updatePromises)
}

/**
 * Interface for yarn remnant data
 */
export interface YarnRemnantData {
  originalBatchId: string
  originalColor: string
  originalColorCode?: string
  condition: 'Excellent' | 'Good' | 'Fair' | 'Tangled' | 'Needs sorting'
  sourceProject?: string
  sourceProjectId?: string
  createdFrom: 'project_completion' | 'manual_entry' | 'batch_split' | 'leftover'
  originalProducer?: string
  originalComposition?: string
  estimatedLength?: string
  suitableFor?: string
}

/**
 * Check if an item is a yarn remnant
 */
export function isYarnRemnant(categoryName?: string): boolean {
  return categoryName === 'Garn Restegarn'
}

/**
 * Create a remnant from an existing yarn batch
 */
export async function createRemnantFromBatch(
  db: PrismaClient,
  originalBatchId: string,
  userId: string,
  remnantData: {
    remainingAmount: number
    unit: string
    condition: string
    sourceProjectId?: string
    notes?: string
  }
) {
  // Get the original batch
  const originalBatch = await db.item.findFirst({
    where: { id: originalBatchId, userId },
    include: { category: true, location: true }
  })

  if (!originalBatch) {
    throw new Error('Original batch not found')
  }

  const originalBatchData = originalBatch.categoryData ? JSON.parse(originalBatch.categoryData) : {}

  // Get the remnant category
  const remnantCategory = await db.category.findFirst({
    where: { name: 'Garn Restegarn' }
  })

  if (!remnantCategory) {
    throw new Error('Garn Restegarn category not found')
  }

  // Create the remnant item
  const remnant = await db.item.create({
    data: {
      name: `${originalBatch.name} - Rest`,
      description: `Garnrest fra ${originalBatch.name}`,
      totalQuantity: 1,
      availableQuantity: remnantData.remainingAmount,
      consumedQuantity: 0,
      unit: remnantData.unit,
      userId,
      categoryId: remnantCategory.id,
      locationId: originalBatch.locationId,
      categoryData: JSON.stringify({
        originalBatchId: originalBatchId,
        originalColor: originalBatchData.color || 'Ukjent',
        originalColorCode: originalBatchData.colorCode,
        condition: remnantData.condition,
        sourceProjectId: remnantData.sourceProjectId,
        createdFrom: remnantData.sourceProjectId ? 'project_completion' : 'manual_entry',
        originalProducer: originalBatchData.producer,
        originalComposition: originalBatchData.composition,
        notes: remnantData.notes
      } as YarnRemnantData)
    }
  })

  // Create relation to original batch
  await db.itemRelation.create({
    data: {
      fromItemId: remnant.id,
      toItemId: originalBatchId,
      relationType: 'REMNANT_OF',
      userId
    }
  })

  return remnant
}

/**
 * Get all remnants for a user
 */
export async function getRemnants(
  db: PrismaClient,
  userId: string,
  filters?: {
    minAmount?: number
    unit?: string
    condition?: string
    originalBatchId?: string
  }
) {
  const remnantCategory = await db.category.findFirst({
    where: { name: 'Garn Restegarn' }
  })

  if (!remnantCategory) {
    return []
  }

  const where: any = {
    userId,
    categoryId: remnantCategory.id,
    availableQuantity: { gt: 0 }
  }

  if (filters?.minAmount) {
    where.availableQuantity = { gte: filters.minAmount }
  }

  if (filters?.unit) {
    where.unit = filters.unit
  }

  const remnants = await db.item.findMany({
    where,
    include: {
      category: true,
      location: true,
      itemRelationsFrom: {
        where: { relationType: 'REMNANT_OF' },
        include: {
          toItem: {
            include: { category: true }
          }
        }
      }
    },
    orderBy: [
      { availableQuantity: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return remnants.filter(remnant => {
    if (filters?.originalBatchId) {
      const hasRelation = remnant.itemRelationsFrom.some(rel => rel.toItemId === filters.originalBatchId)
      if (!hasRelation) return false
    }

    if (filters?.condition) {
      const remnantData = remnant.categoryData ? JSON.parse(remnant.categoryData) : {}
      if (remnantData.condition !== filters.condition) return false
    }

    return true
  })
}

/**
 * Use a remnant in a project
 */
export async function useRemnantInProject(
  db: PrismaClient,
  remnantId: string,
  projectId: string,
  amountUsed: number,
  userId: string,
  notes?: string
) {
  const remnant = await db.item.findFirst({
    where: { id: remnantId, userId }
  })

  if (!remnant) {
    throw new Error('Remnant not found')
  }

  if (remnant.availableQuantity < amountUsed) {
    throw new Error('Not enough remnant available')
  }

  // Update remnant quantity
  const updatedRemnant = await db.item.update({
    where: { id: remnantId },
    data: {
      availableQuantity: remnant.availableQuantity - amountUsed,
      consumedQuantity: remnant.consumedQuantity + amountUsed
    }
  })

  // Create project usage record
  await db.projectYarnUsage.create({
    data: {
      projectId,
      itemId: remnantId,
      quantityUsed: amountUsed,
      notes: notes || `Brukt ${amountUsed}${remnant.unit} garnrest`
    }
  })

  // Log activity
  await db.activity.create({
    data: {
      type: 'ITEM_USED',
      description: `Brukt ${amountUsed}${remnant.unit} av garnrest i prosjekt`,
      userId,
      itemId: remnantId,
      metadata: JSON.stringify({
        projectId,
        amountUsed,
        remainingAmount: updatedRemnant.availableQuantity
      })
    }
  })

  return updatedRemnant
}

/**
 * Get remnants statistics for a user
 */
export async function getRemnantStats(db: PrismaClient, userId: string) {
  const remnantCategory = await db.category.findFirst({
    where: { name: 'Garn Restegarn' }
  })

  if (!remnantCategory) {
    return {
      totalRemnants: 0,
      totalWeight: 0,
      totalLength: 0,
      byCondition: {},
      byUnit: {}
    }
  }

  const remnants = await db.item.findMany({
    where: {
      userId,
      categoryId: remnantCategory.id,
      availableQuantity: { gt: 0 }
    }
  })

  const stats = {
    totalRemnants: remnants.length,
    totalWeight: 0,
    totalLength: 0,
    byCondition: {} as Record<string, number>,
    byUnit: {} as Record<string, { count: number, totalAmount: number }>
  }

  remnants.forEach(remnant => {
    const data = remnant.categoryData ? JSON.parse(remnant.categoryData) : {}
    
    // Count by condition
    const condition = data.condition || 'Unknown'
    stats.byCondition[condition] = (stats.byCondition[condition] || 0) + 1

    // Count by unit
    const unit = remnant.unit
    if (!stats.byUnit[unit]) {
      stats.byUnit[unit] = { count: 0, totalAmount: 0 }
    }
    stats.byUnit[unit].count += 1
    stats.byUnit[unit].totalAmount += remnant.availableQuantity

    // Add to totals (assuming gram and meter as main units)
    if (unit === 'g' || unit === 'gram') {
      stats.totalWeight += remnant.availableQuantity
    }
    if (unit === 'm' || unit === 'meter') {
      stats.totalLength += remnant.availableQuantity
    }
  })

  return stats
}
