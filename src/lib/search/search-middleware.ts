import { Prisma } from '@prisma/client'
import { meilisearchService, SearchDocument } from './meilisearch-service'

export function createSearchMiddleware() {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      query: {
        item: {
          async create({ args, query }) {
            const result = await query(args)
            
            // Index the new item
            if (result) {
              await indexItem(result.id)
            }
            
            return result
          },
          
          async update({ args, query }) {
            const result = await query(args)
            
            // Re-index the updated item
            if (result) {
              await indexItem(result.id)
            }
            
            return result
          },
          
          async delete({ args, query }) {
            const itemId = args.where.id
            const result = await query(args)
            
            // Remove from search index
            if (itemId) {
              await meilisearchService.deleteDocument(`item_${itemId}`)
            }
            
            return result
          },
          
          async deleteMany({ args, query }) {
            // For bulk deletes, we need to get the IDs first
            const items = await client.item.findMany({
              where: args.where,
              select: { id: true }
            })
            
            const result = await query(args)
            
            // Remove from search index
            for (const item of items) {
              await meilisearchService.deleteDocument(`item_${item.id}`)
            }
            
            return result
          }
        },
        
        location: {
          async create({ args, query }) {
            const result = await query(args)
            
            if (result) {
              await indexLocation(result.id)
            }
            
            return result
          },
          
          async update({ args, query }) {
            const result = await query(args)
            
            if (result) {
              await indexLocation(result.id)
            }
            
            return result
          },
          
          async delete({ args, query }) {
            const locationId = args.where.id
            const result = await query(args)
            
            if (locationId) {
              await meilisearchService.deleteDocument(`location_${locationId}`)
            }
            
            return result
          }
        },
        
        category: {
          async create({ args, query }) {
            const result = await query(args)
            
            if (result) {
              await indexCategory(result.id)
            }
            
            return result
          },
          
          async update({ args, query }) {
            const result = await query(args)
            
            if (result) {
              await indexCategory(result.id)
            }
            
            return result
          },
          
          async delete({ args, query }) {
            const categoryId = args.where.id
            const result = await query(args)
            
            if (categoryId) {
              await meilisearchService.deleteDocument(`category_${categoryId}`)
            }
            
            return result
          }
        }
      }
    })
  })
}

async function indexItem(itemId: string) {
  try {
    // Get fresh item data with relations
    const item = await client.item.findUnique({
      where: { id: itemId },
      include: {
        category: { select: { name: true } },
        location: { select: { name: true } },
        tags: { select: { name: true } }
      }
    })

    if (!item) return

    const searchDoc: SearchDocument = {
      id: `item_${item.id}`,
      type: 'item',
      name: item.name,
      description: item.description || undefined,
      userId: item.userId,
      barcode: item.barcode || undefined,
      brand: item.brand || undefined,
      categoryName: item.category?.name,
      locationName: item.location?.name,
      tags: item.tags.map(t => t.name),
      price: item.price || undefined,
      quantity: item.quantity,
      expiryDate: item.expiryDate?.toISOString(),
      imageUrl: item.imageUrl || undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }

    await meilisearchService.indexDocument(searchDoc)
  } catch (error) {
    console.error(`Error indexing item ${itemId}:`, error)
  }
}

async function indexLocation(locationId: string) {
  try {
    const location = await client.location.findUnique({
      where: { id: locationId },
      include: {
        parent: { select: { name: true } }
      }
    })

    if (!location) return

    const searchDoc: SearchDocument = {
      id: `location_${location.id}`,
      type: 'location',
      name: location.name,
      description: location.description || undefined,
      userId: location.userId,
      locationType: location.type,
      parentLocationName: location.parent?.name,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString()
    }

    await meilisearchService.indexDocument(searchDoc)
  } catch (error) {
    console.error(`Error indexing location ${locationId}:`, error)
  }
}

async function indexCategory(categoryId: string) {
  try {
    const category = await client.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: { select: { items: true } }
      }
    })

    if (!category) return

    const searchDoc: SearchDocument = {
      id: `category_${category.id}`,
      type: 'category',
      name: category.name,
      description: category.description || undefined,
      userId: category.userId,
      icon: category.icon || undefined,
      itemCount: category._count.items,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }

    await meilisearchService.indexDocument(searchDoc)
  } catch (error) {
    console.error(`Error indexing category ${categoryId}:`, error)
  }
}

// Import client to avoid circular dependency
import { db as client } from '@/lib/db'
