import { MeiliSearch } from 'meilisearch'

// Interface for search document
export interface SearchDocument {
  id: string
  type: 'item' | 'location' | 'category'
  name: string
  description?: string
  userId: string
  
  // Item specific fields
  barcode?: string
  brand?: string
  categoryName?: string
  locationName?: string
  tags?: string[]
  price?: number
  quantity?: number
  expiryDate?: string
  imageUrl?: string
  
  // Location specific fields
  locationType?: string
  parentLocationName?: string
  
  // Category specific fields
  icon?: string
  itemCount?: number
  
  // Computed fields for better search
  searchableText?: string
  createdAt: string
  updatedAt: string
}

export class MeilisearchService {
  private client: MeiliSearch | null = null
  private isInitialized = false

  constructor() {
    // Only initialize on server side
    if (typeof window === 'undefined') {
      this.initialize()
    }
  }

  private initialize() {
    try {
      const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700'
      const apiKey = process.env.MEILISEARCH_API_KEY

      this.client = new MeiliSearch({ host, apiKey })
      this.isInitialized = true
      console.log('Meilisearch client initialized')
    } catch (error) {
      console.error('Failed to initialize Meilisearch:', error)
    }
  }

  async createIndices() {
    if (!this.client) return

    try {
      // Create main search index
      await this.client.createIndex('hjemmeinventar', { primaryKey: 'id' })
      
      const index = this.client.index('hjemmeinventar')

      // Configure searchable attributes
      await index.updateSearchableAttributes([
        'name',
        'description', 
        'searchableText',
        'brand',
        'categoryName',
        'locationName',
        'tags',
        'barcode'
      ])

      // Configure filterable attributes
      await index.updateFilterableAttributes([
        'type',
        'userId',
        'categoryName',
        'locationName',
        'locationType',
        'price',
        'quantity',
        'expiryDate',
        'tags',
        'createdAt',
        'updatedAt'
      ])

      // Configure sortable attributes
      await index.updateSortableAttributes([
        'name',
        'price',
        'quantity',
        'createdAt',
        'updatedAt',
        'expiryDate'
      ])

      // Configure ranking rules for relevance
      await index.updateRankingRules([
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness'
      ])

      // Configure synonyms
      await index.updateSynonyms({
        'tv': ['television', 'fjernsyn'],
        'pc': ['computer', 'datamaskin'],
        'mobil': ['telefon', 'smartphone'],
        'bil': ['car', 'kjøretøy']
      })

      // Configure stop words (Norwegian)
      await index.updateStopWords([
        'og', 'eller', 'men', 'for', 'til', 'av', 'på', 'i', 'med', 'den', 'det', 'de'
      ])

      console.log('Meilisearch indices configured successfully')
    } catch (error) {
      console.error('Error creating Meilisearch indices:', error)
    }
  }

  async indexDocument(document: SearchDocument) {
    if (!this.client) return

    try {
      const index = this.client.index('hjemmeinventar')
      
      // Enhance document with searchable text
      const enhancedDocument = {
        ...document,
        searchableText: this.createSearchableText(document)
      }

      await index.addDocuments([enhancedDocument])
      console.log(`Indexed document: ${document.type} - ${document.name}`)
    } catch (error) {
      console.error('Error indexing document:', error)
    }
  }

  async indexMultipleDocuments(documents: SearchDocument[]) {
    if (!this.client || documents.length === 0) return

    try {
      const index = this.client.index('hjemmeinventar')
      
      const enhancedDocuments = documents.map(doc => ({
        ...doc,
        searchableText: this.createSearchableText(doc)
      }))

      await index.addDocuments(enhancedDocuments)
      console.log(`Bulk indexed ${documents.length} documents`)
    } catch (error) {
      console.error('Error bulk indexing documents:', error)
    }
  }

  async deleteDocument(id: string) {
    if (!this.client) return

    try {
      const index = this.client.index('hjemmeinventar')
      await index.deleteDocument(id)
      console.log(`Deleted document: ${id}`)
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  async search(query: string, options: {
    userId: string
    type?: 'item' | 'location' | 'category'
    filters?: Record<string, any>
    limit?: number
    offset?: number
    sort?: string[]
  }) {
    if (!this.client) {
      console.warn('Meilisearch not available, falling back to simple search')
      return { hits: [], totalHits: 0, processingTimeMs: 0 }
    }

    try {
      const index = this.client.index('hjemmeinventar')
      
      // Build filter string
      let filter = `userId = "${options.userId}"`
      
      if (options.type) {
        filter += ` AND type = "${options.type}"`
      }

      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              const arrayFilter = value.map(v => `"${v}"`).join(', ')
              filter += ` AND ${key} IN [${arrayFilter}]`
            } else if (typeof value === 'string') {
              filter += ` AND ${key} = "${value}"`
            } else {
              filter += ` AND ${key} = ${value}`
            }
          }
        }
      }

      const searchOptions: any = {
        filter,
        limit: options.limit || 20,
        offset: options.offset || 0,
        attributesToHighlight: ['name', 'description', 'brand'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        attributesToCrop: ['description'],
        cropLength: 200
      }

      if (options.sort) {
        searchOptions.sort = options.sort
      }

      const results = await index.search(query, searchOptions)

      return {
        hits: results.hits,
        totalHits: results.estimatedTotalHits || 0,
        processingTimeMs: results.processingTimeMs,
        query: results.query,
        facetDistribution: results.facetDistribution
      }
    } catch (error) {
      console.error('Error searching with Meilisearch:', error)
      return { hits: [], totalHits: 0, processingTimeMs: 0 }
    }
  }

  async getFacets(userId: string, facets: string[]) {
    if (!this.client) return {}

    try {
      const index = this.client.index('hjemmeinventar')
      
      const results = await index.search('', {
        filter: `userId = "${userId}"`,
        facets,
        limit: 0
      })

      return results.facetDistribution || {}
    } catch (error) {
      console.error('Error getting facets:', error)
      return {}
    }
  }

  async reindexUserData(userId: string, data: {
    items: any[]
    locations: any[]
    categories: any[]
  }) {
    if (!this.client) return

    try {
      // Delete existing documents for user
      const index = this.client.index('hjemmeinventar')
      await index.deleteDocuments({ filter: `userId = "${userId}"` })

      // Prepare documents for indexing
      const documents: SearchDocument[] = []

      // Index items
      data.items.forEach(item => {
        documents.push({
          id: `item_${item.id}`,
          type: 'item',
          name: item.name,
          description: item.description,
          userId,
          barcode: item.barcode,
          brand: item.brand,
          categoryName: item.category?.name,
          locationName: item.location?.name,
          tags: item.tags?.map((t: any) => t.name) || [],
          price: item.price,
          quantity: item.quantity,
          expiryDate: item.expiryDate?.toISOString(),
          imageUrl: item.imageUrl,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString()
        })
      })

      // Index locations
      data.locations.forEach(location => {
        documents.push({
          id: `location_${location.id}`,
          type: 'location',
          name: location.name,
          description: location.description,
          userId,
          locationType: location.type,
          parentLocationName: location.parent?.name,
          createdAt: location.createdAt.toISOString(),
          updatedAt: location.updatedAt.toISOString()
        })
      })

      // Index categories
      data.categories.forEach(category => {
        documents.push({
          id: `category_${category.id}`,
          type: 'category',
          name: category.name,
          description: category.description,
          userId,
          icon: category.icon,
          itemCount: category._count?.items || 0,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString()
        })
      })

      await this.indexMultipleDocuments(documents)
      console.log(`Reindexed ${documents.length} documents for user ${userId}`)
    } catch (error) {
      console.error('Error reindexing user data:', error)
    }
  }

  private createSearchableText(document: SearchDocument): string {
    const parts = [
      document.name,
      document.description,
      document.brand,
      document.categoryName,
      document.locationName,
      document.parentLocationName,
      ...(document.tags || [])
    ].filter(Boolean)

    return parts.join(' ').toLowerCase()
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    if (!this.client) return false

    try {
      await this.client.health()
      return true
    } catch {
      return false
    }
  }

  // Get index stats
  async getStats() {
    if (!this.client) return null

    try {
      const index = this.client.index('hjemmeinventar')
      return await index.getStats()
    } catch (error) {
      console.error('Error getting index stats:', error)
      return null
    }
  }
}

// Singleton instance
export const meilisearchService = new MeilisearchService()
