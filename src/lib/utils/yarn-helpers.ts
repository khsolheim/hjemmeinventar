// Hjelpefunksjoner for Yarn Master/Batch system
import { type PrismaClient } from '@prisma/client'

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
  return await db.item.findMany({
    where: {
      userId,
      relatedTo: {
        some: {
          id: masterId
        }
      }
    },
    include: {
      location: true,
      tags: true,
      category: true
    },
    orderBy: [
      { createdAt: 'desc' }
    ]
  })
}

/**
 * Henter master item for en batch
 */
export async function getMasterForBatch(
  db: PrismaClient,
  batchId: string,
  userId: string
) {
  const batch = await db.item.findFirst({
    where: {
      id: batchId,
      userId
    },
    include: {
      relatedItems: {
        include: {
          category: true
        }
      }
    }
  })

  if (!batch) return null

  // Finn master blant relaterte items
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
    const quantity = batchData.quantity || 0
    const pricePerSkein = batchData.pricePerSkein || 0
    
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

  // Opprett batch item
  const batch = await db.item.create({
    data: {
      name: batchData.name,
      description: `Batch ${batchData.batchNumber} - ${batchData.color}`,
      userId: batchData.userId,
      categoryId: batchCategory.id,
      locationId: batchData.locationId,
      totalQuantity: batchData.quantity,
      availableQuantity: batchData.quantity,
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
  
  // Oppdater alle batches med nye felles data
  const updatePromises = batches.map(async (batch) => {
    const currentBatchData = batch.categoryData ? JSON.parse(batch.categoryData) : {}
    
    // Behold batch-spesifikke data, oppdater kun master-data
    const updatedBatchData = {
      ...currentBatchData,
      // Oppdater kun master-data som er endret
      ...(updatedMasterData.producer && { masterProducer: updatedMasterData.producer }),
      ...(updatedMasterData.composition && { masterComposition: updatedMasterData.composition }),
      // Legg til andre master-felter som ønsket
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
