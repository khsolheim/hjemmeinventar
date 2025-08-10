import OpenAI from 'openai'
import { db } from '@/lib/db'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// Types for AI suggestions
export interface SmartSuggestion {
  type: 'category' | 'location' | 'tags' | 'duplicate'
  confidence: number
  suggestion: string | string[]
  reasoning: string
}

export interface CategorySuggestion {
  categoryId: string
  categoryName: string
  confidence: number
  reasoning: string
}

export interface LocationSuggestion {
  locationId: string
  locationName: string
  confidence: number
  reasoning: string
}

export interface DuplicateItem {
  itemId: string
  itemName: string
  similarity: number
  reasons: string[]
}

class AIService {
  private isEnabled: boolean

  constructor() {
    this.isEnabled = !!process.env.OPENAI_API_KEY
  }

  // Check if AI features are available
  isAIEnabled(): boolean {
    return this.isEnabled
  }

  // Smart category suggestion based on item name and description
  async suggestCategory(itemName: string, description?: string): Promise<CategorySuggestion | null> {
    if (!this.isEnabled) return null

    try {
      // Get available categories from database
      const categories = await db.category.findMany({
        select: { id: true, name: true, description: true }
      })

      const categoryList = categories.map(cat => `${cat.name}: ${cat.description || 'Ingen beskrivelse'}`).join('\n')

      const prompt = `
Analyser følgende gjenstand og foreslå den mest passende kategorien:

Gjenstand: "${itemName}"
Beskrivelse: "${description || 'Ingen beskrivelse'}"

Tilgjengelige kategorier:
${categoryList}

Gi kun navnet på den beste kategorien og en kort begrunnelse på norsk.
Format: {"category": "kategorinavn", "reasoning": "begrunnelse"}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du er en ekspert på å organisere og kategorisere gjenstander i husholdninger. Svar alltid på norsk og hold deg til de oppgitte kategoriene.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.3
      })

      const content = response.choices[0]?.message?.content
      if (!content) return null

      try {
        const parsed = JSON.parse(content)
        const matchedCategory = categories.find(cat => 
          cat.name.toLowerCase() === parsed.category.toLowerCase()
        )

        if (matchedCategory) {
          return {
            categoryId: matchedCategory.id,
            categoryName: matchedCategory.name,
            confidence: 0.85, // AI confidence score
            reasoning: parsed.reasoning
          }
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
      }

      return null
    } catch (error) {
      console.error('AI category suggestion failed:', error)
      return null
    }
  }

  // Generate smart tags based on item details
  async suggestTags(itemName: string, description?: string, categoryName?: string): Promise<string[]> {
    if (!this.isEnabled) return []

    try {
      const prompt = `
Generer 3-5 relevante tags for følgende gjenstand:

Gjenstand: "${itemName}"
Beskrivelse: "${description || 'Ingen beskrivelse'}"
Kategori: "${categoryName || 'Ukjent'}"

Regler:
- Tags skal være på norsk
- Maks 2 ord per tag
- Fokuser på: merke, farge, materiale, størrelse, tilstand, bruk
- Ikke inkluder kategorinavn som tag
- Format: ["tag1", "tag2", "tag3"]

Kun JSON-array som svar:
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du er ekspert på å lage relevante tags for gjenstander. Returner kun en JSON-array med tags på norsk.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.4
      })

      const content = response.choices[0]?.message?.content
      if (!content) return []

      try {
        const tags = JSON.parse(content)
        return Array.isArray(tags) ? tags.slice(0, 5) : []
      } catch (parseError) {
        console.error('Failed to parse AI tags:', parseError)
        return []
      }
    } catch (error) {
      console.error('AI tag suggestion failed:', error)
      return []
    }
  }

  // Suggest optimal location for an item
  async suggestLocation(
    itemName: string, 
    categoryName?: string, 
    description?: string
  ): Promise<LocationSuggestion | null> {
    if (!this.isEnabled) return null

    try {
      // Get available locations from database
      const locations = await db.location.findMany({
        select: { id: true, name: true, description: true, type: true }
      })

      const locationList = locations.map(loc => 
        `${loc.name} (${loc.type}): ${loc.description || 'Ingen beskrivelse'}`
      ).join('\n')

      const prompt = `
Foreslå beste oppbevaringssted for følgende gjenstand:

Gjenstand: "${itemName}"
Kategori: "${categoryName || 'Ukjent'}"
Beskrivelse: "${description || 'Ingen beskrivelse'}"

Tilgjengelige lokasjoner:
${locationList}

Vurder:
- Type gjenstand og oppbevaringsbehovet
- Temperatur og fuktighet
- Tilgjengelighet og bruksfrekvens
- Sikkerhet og organisering

Format: {"location": "lokasjonsnavn", "reasoning": "detaljert begrunnelse"}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du er ekspert på optimal oppbevaring av gjenstander i hjem. Gi praktiske råd på norsk.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.3
      })

      const content = response.choices[0]?.message?.content
      if (!content) return null

      try {
        const parsed = JSON.parse(content)
        const matchedLocation = locations.find(loc => 
          loc.name.toLowerCase() === parsed.location.toLowerCase()
        )

        if (matchedLocation) {
          return {
            locationId: matchedLocation.id,
            locationName: matchedLocation.name,
            confidence: 0.80,
            reasoning: parsed.reasoning
          }
        }
      } catch (parseError) {
        console.error('Failed to parse AI location response:', parseError)
      }

      return null
    } catch (error) {
      console.error('AI location suggestion failed:', error)
      return null
    }
  }

  // Detect potential duplicates using semantic similarity
  async detectDuplicates(
    itemName: string, 
    description?: string, 
    categoryId?: string
  ): Promise<DuplicateItem[]> {
    if (!this.isEnabled) return []

    try {
      // Get existing items from same category or all items if no category
      const existingItems = await db.item.findMany({
        where: categoryId ? { categoryId } : {},
        select: { 
          id: true, 
          name: true, 
          description: true, 
          categoryId: true,
          category: { select: { name: true } }
        },
        take: 50 // Limit for performance
      })

      if (existingItems.length === 0) return []

      const itemList = existingItems.map(item => 
        `${item.name}: ${item.description || 'Ingen beskrivelse'}`
      ).join('\n')

      const prompt = `
Analyser om følgende nye gjenstand kan være en duplikat av eksisterende gjenstander:

Ny gjenstand: "${itemName}"
Beskrivelse: "${description || 'Ingen beskrivelse'}"

Eksisterende gjenstander:
${itemList}

Finn potensielle duplikater basert på:
- Navn-likhet
- Beskrivelse-likhet  
- Samme type/kategori
- Merke eller modell

Format for hvert duplikat:
{"name": "gjenstandsnavn", "similarity": 0.0-1.0, "reasons": ["grunn1", "grunn2"]}

Kun JSON-array med duplikater over 70% likhet:
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du er ekspert på å identifisere duplikate gjenstander. Vær konservativ - kun flagg tydelige duplikater.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.2
      })

      const content = response.choices[0]?.message?.content
      if (!content) return []

      try {
        const duplicates = JSON.parse(content)
        if (!Array.isArray(duplicates)) return []

        return duplicates
          .filter(dup => dup.similarity >= 0.7)
          .map(dup => {
            const matchedItem = existingItems.find(item => 
              item.name.toLowerCase() === dup.name.toLowerCase()
            )
            return {
              itemId: matchedItem?.id || '',
              itemName: dup.name,
              similarity: dup.similarity,
              reasons: dup.reasons || []
            }
          })
          .filter(dup => dup.itemId) // Only include items we found in DB
          .slice(0, 3) // Max 3 duplicates
      } catch (parseError) {
        console.error('Failed to parse AI duplicates response:', parseError)
      }

      return []
    } catch (error) {
      console.error('AI duplicate detection failed:', error)
      return []
    }
  }

  // Generate predictive insights about inventory
  async generateInsights(userId: string): Promise<string[]> {
    if (!this.isEnabled) return []

    try {
      // Get user's inventory statistics
      const [itemStats, recentActivities, expiringItems] = await Promise.all([
        db.item.groupBy({
          by: ['categoryId'],
          where: { userId },
          _count: { id: true }
        }),
        db.activity.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { type: true, createdAt: true }
        }),
        db.item.findMany({
          where: {
            userId,
            expiryDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
            }
          },
          select: { name: true, expiryDate: true }
        })
      ])

      const statsText = `
Brukerstatistikk:
- Antall gjenstander per kategori: ${itemStats.map(s => `${s._count.id} items`).join(', ')}
- Siste aktiviteter: ${recentActivities.map(a => a.type).slice(0, 5).join(', ')}
- Utløpende items: ${expiringItems.length} gjenstander utløper snart
`

      const prompt = `
Analyser brukerens inventar og gi 3-5 praktiske innsikter og anbefalinger:

${statsText}

Generer innsikter om:
- Organisering og optimalisering
- Potensielle besparelser
- Vedlikehold og utløp
- Bruksmønstre
- Forbedringsforslag

Hver innsikt skal være:
- Praktisk og handlingsrettet
- Basert på dataene
- Maks 100 tegn
- På norsk

Format: ["innsikt1", "innsikt2", "innsikt3"]
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du er en ekspert på husholdningsorganisering og gir praktiske råd basert på inventardata.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.5
      })

      const content = response.choices[0]?.message?.content
      if (!content) return []

      try {
        const insights = JSON.parse(content)
        return Array.isArray(insights) ? insights.slice(0, 5) : []
      } catch (parseError) {
        console.error('Failed to parse AI insights:', parseError)
      }

      return []
    } catch (error) {
      console.error('AI insights generation failed:', error)
      return []
    }
  }

  // Smart search query enhancement
  async enhanceSearchQuery(query: string, context?: string): Promise<string> {
    if (!this.isEnabled || query.length < 3) return query

    try {
      const prompt = `
Forbedre følgende søkequery for bedre resultater i et inventarsystem:

Opprinnelig query: "${query}"
Kontekst: "${context || 'Generelt søk'}"

Regler:
- Legg til relevante synonymer
- Korriger stavefeil
- Utvid forkortelser
- Behold originalens intensjon
- Maks 100 tegn

Kun den forbedrede queryen som svar:
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du hjelper med å forbedre søkequeries for inventarsystemer. Svar kun med den forbedrede queryen.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.3
      })

      const enhanced = response.choices[0]?.message?.content?.trim()
      return enhanced || query
    } catch (error) {
      console.error('AI search enhancement failed:', error)
      return query
    }
  }
}

// Export singleton instance
export const aiService = new AIService()

