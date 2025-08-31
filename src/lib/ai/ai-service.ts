import OpenAI from 'openai'
import { db } from '@/lib/db'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
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
  private db: typeof db
  private openai: typeof openai

  constructor() {
    this.isEnabled = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY
    this.db = db
    this.openai = openai
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

  // Enhanced item creation with comprehensive AI suggestions
  async enhanceItem(name: string, description?: string, context?: string): Promise<any> {
    if (!this.isEnabled) {
      return {
        category: null,
        location: null,
        tags: [],
        duplicates: [],
        enhancedDescription: description,
        suggestions: []
      }
    }

    try {
      // Get category and location suggestions in parallel
      const [categorySuggestion, locationSuggestion] = await Promise.all([
        this.suggestCategory(name, description),
        this.suggestLocation(name, undefined, description)
      ])

      // Get tags
      const tags = await this.suggestTags(name, description, categorySuggestion?.categoryName)

      // Check for duplicates
      const duplicates = await this.detectDuplicates(name, description, categorySuggestion?.categoryId)

      // Enhanced description generation if none provided
      let enhancedDescription = description
      if (!description || description.length < 10) {
        const descPrompt = `
Generer en beskrivelse for følgende gjenstand basert på navnet:

Gjenstand: "${name}"
Kategori: "${categorySuggestion?.categoryName || 'Ukjent'}"
Lokasjon: "${locationSuggestion?.locationName || 'Ukjent'}"

Regler:
- Beskrivelse skal være praktisk og nyttig
- Inkluder relevante detaljer som farge, størrelse, materiale hvis relevant
- Maks 100 tegn
- På norsk

Kun beskrivelsen som svar:
`

        const descResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Du genererer praktiske beskrivelser for gjenstander i inventarsystemer.'
            },
            { role: 'user', content: descPrompt }
          ],
          max_tokens: 80,
          temperature: 0.4
        })

        const aiDescription = descResponse.choices[0]?.message?.content?.trim()
        if (aiDescription && aiDescription.length > 10) {
          enhancedDescription = aiDescription
        }
      }

      // Generate actionable suggestions
      const suggestions = []
      if (categorySuggestion) {
        suggestions.push({
          type: 'category',
          value: categorySuggestion.categoryId,
          label: `Bruk kategori: ${categorySuggestion.categoryName}`,
          reasoning: categorySuggestion.reasoning
        })
      }

      if (locationSuggestion) {
        suggestions.push({
          type: 'location',
          value: locationSuggestion.locationId,
          label: `Plasser i: ${locationSuggestion.locationName}`,
          reasoning: locationSuggestion.reasoning
        })
      }

      if (tags.length > 0) {
        suggestions.push({
          type: 'tags',
          value: tags,
          label: `Legg til tags: ${tags.slice(0, 3).join(', ')}`,
          reasoning: 'Relevante søkeord for enklere gjenfinning'
        })
      }

      return {
        category: categorySuggestion,
        location: locationSuggestion,
        tags,
        duplicates,
        enhancedDescription,
        suggestions: suggestions.slice(0, 3) // Max 3 suggestions
      }
    } catch (error) {
      console.error('AI item enhancement failed:', error)
      return {
        category: null,
        location: null,
        tags: [],
        duplicates: [],
        enhancedDescription: description,
        suggestions: []
      }
    }
  }

  // Personalized dashboard recommendations
  async getPersonalizedDashboard(userId: string): Promise<any> {
    if (!this.isEnabled) {
      return {
        topCategories: [],
        recentLocations: [],
        suggestedActions: [],
        insights: []
      }
    }

    try {
      // Get user's activity and preferences
      const [recentItems, userLocations, recentActivities, categories] = await Promise.all([
        db.item.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { category: true, location: true }
        }),
        db.location.findMany({
          where: { userId },
          include: { _count: { select: { distributions: true } } }
        }),
        db.activity.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50
        }),
        db.category.findMany({
          include: { _count: { select: { items: true } } }
        })
      ])

      // Analyze user's behavior patterns
      const behaviorAnalysis = this.analyzeUserBehavior(recentItems, recentActivities, userLocations)

      // Generate personalized recommendations
      const recommendations = await this.generatePersonalizedRecommendations(
        behaviorAnalysis,
        recentItems,
        userLocations,
        categories
      )

      return {
        ...behaviorAnalysis,
        ...recommendations,
        insights: await this.generateInsights(userId)
      }
    } catch (error) {
      console.error('Personalized dashboard failed:', error)
      return {
        topCategories: [],
        recentLocations: [],
        suggestedActions: [],
        insights: []
      }
    }
  }

  // Analyze user behavior patterns
  private analyzeUserBehavior(recentItems: any[], recentActivities: any[], userLocations: any[]) {
    // Most used categories
    const categoryUsage = recentItems.reduce((acc, item) => {
      const catId = item.categoryId
      acc[catId] = (acc[catId] || 0) + 1
      return acc
    }, {})

    const topCategories = Object.entries(categoryUsage)
      .sort(([,a]: [string, unknown], [,b]: [string, unknown]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([categoryId, count]) => ({
        categoryId,
        count,
        name: recentItems.find(item => item.categoryId === categoryId)?.category?.name || 'Ukjent'
      }))

    // Most active locations
    const locationUsage = recentItems.reduce((acc, item) => {
      const locId = item.locationId
      acc[locId] = (acc[locId] || 0) + 1
      return acc
    }, {})

    const recentLocations = Object.entries(locationUsage)
      .sort(([,a]: [string, unknown], [,b]: [string, unknown]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([locationId, count]) => ({
        locationId,
        count,
        name: userLocations.find(loc => loc.id === locationId)?.name || 'Ukjent'
      }))

    // Time-based patterns
    const hourOfDay = recentActivities.map(activity =>
      new Date(activity.createdAt).getHours()
    )

    const mostActiveHour = hourOfDay.length > 0
      ? Math.round(hourOfDay.reduce((a, b) => a + b, 0) / hourOfDay.length)
      : 12

    // Activity types
    const activityTypes = recentActivities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1
      return acc
    }, {})

    return {
      topCategories,
      recentLocations,
      mostActiveHour,
      activityTypes,
      totalItems: recentItems.length,
      totalLocations: userLocations.length
    }
  }

  // Advanced AI categorization with machine learning
  async smartCategorization(itemName: string, itemDescription?: string, imageData?: string): Promise<any> {
    if (!this.isEnabled) {
      return { category: null, confidence: 0, suggestions: [] }
    }

    try {
      // Get all categories for context
      const categories = await this.db.category.findMany({
        include: { items: { take: 10, orderBy: { createdAt: 'desc' } } }
      })

      // Analyze item patterns and create training data
      const categoryPatterns = this.analyzeCategoryPatterns(categories)

      // Use OpenAI for advanced categorization
      const prompt = `Du er en ekspert på å kategorisere gjenstander i hjemmet. Analyser følgende gjenstand og foreslå den beste kategorien:

Gjenstand: "${itemName}"
${itemDescription ? `Beskrivelse: "${itemDescription}"` : ''}

Tilgjengelige kategorier:
${categories.map(cat => `- ${cat.name}: ${cat.items?.map(item => item.name).join(', ')}`).join('\n')}

Mønstre jeg har observert:
${categoryPatterns.map(pattern => `- ${pattern.category}: ${pattern.keywords.join(', ')}`).join('\n')}

Svar med JSON format:
{
  "categoryId": "id-til-beste-kategori",
  "confidence": 0.0-1.0,
  "reasoning": "kort forklaring",
  "alternativeCategories": ["id1", "id2"],
  "suggestedTags": ["tag1", "tag2"]
}`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      })

      const result = JSON.parse(response.choices[0].message.content)

      // Find the actual category object
      const suggestedCategory = categories.find(cat => cat.id === result.categoryId)

      return {
        category: suggestedCategory ? {
          id: suggestedCategory.id,
          name: suggestedCategory.name,
          confidence: result.confidence,
          reasoning: result.reasoning
        } : null,
        alternativeCategories: result.alternativeCategories?.map((id: string) =>
          categories.find(cat => cat.id === id)
        ).filter(Boolean) || [],
        suggestedTags: result.suggestedTags || [],
        rawResponse: result
      }
    } catch (error) {
      console.error('Smart categorization failed:', error)
      return { category: null, confidence: 0, suggestions: [] }
    }
  }

  // Analyze category patterns from existing data
  private analyzeCategoryPatterns(categories: any[]) {
    const patterns = categories.map(category => {
      const itemNames = category.items?.map(item => item.name.toLowerCase()) || []
      const descriptions = category.items?.map(item => item.description?.toLowerCase()).filter(Boolean) || []

      // Extract common keywords
      const keywords = this.extractKeywords([...itemNames, ...descriptions])

      return {
        category: category.name,
        keywords: keywords.slice(0, 10), // Top 10 keywords
        itemCount: category.items?.length || 0
      }
    })

    return patterns.sort((a, b) => b.itemCount - a.itemCount)
  }

  // Extract keywords from text
  private extractKeywords(texts: string[]): string[] {
    const stopWords = ['og', 'i', 'på', 'med', 'for', 'til', 'av', 'en', 'et', 'den', 'det', 'de', 'som', 'er', 'har', 'kan', 'vil', 'skal']
    const words = texts
      .join(' ')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))

    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .map(([word]) => word)
  }

  // Smart location suggestions
  async smartLocationSuggestion(itemName: string, itemCategory?: string, existingLocations: any[] = []): Promise<any> {
    if (!this.isEnabled) {
      return { location: null, confidence: 0, reasoning: '' }
    }

    try {
      // Analyze location patterns
      const locationAnalysis = await this.analyzeLocationPatterns(existingLocations)

      const prompt = `Du er en hjemmeorganiserings-ekspert. Foreslå den beste lagringsplassen for følgende gjenstand:

Gjenstand: "${itemName}"
${itemCategory ? `Kategori: "${itemCategory}"` : ''}

Eksisterende lokasjoner og deres innhold:
${locationAnalysis.map(loc => `- ${loc.name}: ${loc.items?.slice(0, 5).map(item => item.name).join(', ')} (${loc.itemCount} ting totalt)`).join('\n')}

Lokasjon mønstre jeg har observert:
${locationAnalysis.slice(0, 3).map(loc => `- ${loc.name}: ${loc.commonCategories?.join(', ')}`).join('\n')}

Svar med JSON format:
{
  "locationId": "id-til-beste-lokasjon",
  "confidence": 0.0-1.0,
  "reasoning": "forklaring på hvorfor denne lokasjonen passer",
  "alternativeLocations": ["id1", "id2"],
  "storageTips": ["tips1", "tips2"]
}`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 400
      })

      const result = JSON.parse(response.choices[0].message.content)

      // Find the actual location object
      const suggestedLocation = existingLocations.find(loc => loc.id === result.locationId)

      return {
        location: suggestedLocation ? {
          id: suggestedLocation.id,
          name: suggestedLocation.name,
          confidence: result.confidence,
          reasoning: result.reasoning
        } : null,
        alternativeLocations: result.alternativeLocations?.map((id: string) =>
          existingLocations.find(loc => loc.id === id)
        ).filter(Boolean) || [],
        storageTips: result.storageTips || [],
        rawResponse: result
      }
    } catch (error) {
      console.error('Smart location suggestion failed:', error)
      return { location: null, confidence: 0, reasoning: '' }
    }
  }

  // Analyze location patterns
  private async analyzeLocationPatterns(locations: any[]) {
    return locations.map(location => {
      const items = location.items || []
      const categories = [...new Set(items.map(item => item.category?.name).filter(Boolean))]
      const itemNames = items.map(item => item.name.toLowerCase())

      return {
        id: location.id,
        name: location.name,
        itemCount: items.length,
        items: items.slice(0, 10), // Sample items for context
        commonCategories: categories.slice(0, 5),
        keywords: this.extractKeywords(itemNames).slice(0, 10)
      }
    })
  }

  // Predictive maintenance and organization
  async predictiveMaintenance(userId: string): Promise<any> {
    if (!this.isEnabled) {
      return { predictions: [], insights: [] }
    }

    try {
      // Get user's items with expiry dates and usage patterns
      const [items, activities] = await Promise.all([
        this.db.item.findMany({
          where: { userId },
          include: { category: true, location: true }
        }),
        this.db.activity.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 100
        })
      ])

      // Analyze expiry patterns
      const expiryPredictions = this.analyzeExpiryPatterns(items)

      // Analyze usage patterns
      const usagePredictions = this.analyzeUsagePatterns(items, activities)

      // Generate organization suggestions
      const organizationInsights = await this.generateOrganizationInsights(items, activities)

      return {
        predictions: [...expiryPredictions, ...usagePredictions],
        insights: organizationInsights,
        summary: {
          expiringSoon: expiryPredictions.filter(p => p.daysUntilExpiry <= 30).length,
          lowStock: usagePredictions.filter(p => p.type === 'low_stock').length,
          organizationTips: organizationInsights.length
        }
      }
    } catch (error) {
      console.error('Predictive maintenance failed:', error)
      return { predictions: [], insights: [] }
    }
  }

  // Analyze expiry patterns
  private analyzeExpiryPatterns(items: any[]) {
    const predictions = []
    const now = new Date()

    for (const item of items) {
      if (item.expiryDate) {
        const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry <= 60) { // Predict within 60 days
          let urgency = 'normal'
          let action = 'Sjekk status'

          if (daysUntilExpiry <= 7) {
            urgency = 'high'
            action = 'Bruk snart eller kast'
          } else if (daysUntilExpiry <= 30) {
            urgency = 'medium'
            action = 'Planlegg bruk'
          }

          predictions.push({
            type: 'expiry',
            itemId: item.id,
            itemName: item.name,
            daysUntilExpiry,
            expiryDate: item.expiryDate,
            urgency,
            action,
            category: item.category?.name,
            location: item.location?.name
          })
        }
      }
    }

    return predictions.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
  }

  // Analyze usage patterns
  private analyzeUsagePatterns(items: any[], activities: any[]) {
    const predictions = []
    const now = new Date()

    // Group activities by item
    const itemActivity = activities.reduce((acc, activity) => {
      if (!acc[activity.itemId]) {
        acc[activity.itemId] = []
      }
      acc[activity.itemId].push(activity)
      return acc
    }, {} as Record<string, any[]>)

    for (const item of items) {
      const activities = itemActivity[item.id] || []
      const usageActivities = activities.filter(a => a.type === 'used' || a.type === 'consumed')

      if (usageActivities.length >= 2) {
        // Calculate usage frequency
        const usageDates = usageActivities.map(a => a.createdAt).sort()
        const intervals = []

        for (let i = 1; i < usageDates.length; i++) {
          const interval = usageDates[i].getTime() - usageDates[i-1].getTime()
          intervals.push(interval)
        }

        if (intervals.length > 0) {
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
          const daysSinceLastUse = (now.getTime() - usageDates[usageDates.length - 1].getTime()) / (1000 * 60 * 60 * 24)

          // Predict when item might run out
          const remainingQuantity = item.availableQuantity
          const usageRate = usageDates.length / (daysSinceLastUse / 30) // Usage per month

          if (usageRate > 0 && remainingQuantity > 0) {
            const daysUntilEmpty = (remainingQuantity / usageRate) * 30

            if (daysUntilEmpty <= 30) {
              predictions.push({
                type: 'low_stock',
                itemId: item.id,
                itemName: item.name,
                daysUntilEmpty: Math.ceil(daysUntilEmpty),
                currentQuantity: remainingQuantity,
                usageRate: Math.round(usageRate * 10) / 10,
                action: daysUntilEmpty <= 7 ? 'Kjøp nytt snart' : 'Planlegg innkjøp',
                urgency: daysUntilEmpty <= 7 ? 'high' : 'medium',
                category: item.category?.name,
                location: item.location?.name
              })
            }
          }
        }
      }
    }

    return predictions.sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty)
  }

  // Generate organization insights
  private async generateOrganizationInsights(items: any[], activities: any[]): Promise<string[]> {
    try {
      // Analyze current organization
      const locationStats = items.reduce((acc, item) => {
        const locId = item.locationId
        if (!acc[locId]) {
          acc[locId] = { count: 0, categories: new Set(), location: item.location }
        }
        acc[locId].count++
        if (item.category) {
          acc[locId].categories.add(item.category.name)
        }
        return acc
      }, {} as Record<string, any>)

      const prompt = `Du er en hjemmeorganiserings-konsulent. Analyser følgende data og gi konkrete råd for bedre organisering:

Lokasjoner og deres innhold:
${Object.entries(locationStats).map(([locId, stats]) =>
  `- ${stats.location?.name || 'Ukjent'}: ${stats.count} ting, kategorier: ${Array.from(stats.categories).join(', ')}`
).join('\n')}

Totale ting: ${items.length}
Aktiviteter siste måned: ${activities.filter(a => {
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  return a.createdAt > monthAgo
}).length}

Gi 3-5 konkrete råd for å forbedre organiseringen, basert på disse dataene. Fokuser på:
- Kategorier som kan grupperes bedre
- Lokasjoner som er overfylte
- Ting som brukes ofte vs sjelden
- Forbedringer i lagringsstrategi

Svar som en liste med råd:`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 400
      })

      const insights = response.choices[0].message.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^- /, '').trim())

      return insights
    } catch (error) {
      console.error('Organization insights failed:', error)
      return []
    }
  }

  // Generate personalized recommendations
  private async generatePersonalizedRecommendations(
    behavior: any,
    recentItems: any[],
    userLocations: any[],
    categories: any[]
  ): Promise<any> {
    const suggestions = []

    // Time-based suggestions
    const currentHour = new Date().getHours()
    if (currentHour >= 18 && currentHour <= 22) {
      suggestions.push({
        type: 'evening_check',
        title: 'Kveldsrutine',
        description: 'Sjekk kjøleskap og pantry før leggetid',
        action: 'Gå til kjøkken',
        icon: '🌙'
      })
    }

    // Location-based suggestions
    if (behavior.recentLocations.length > 0) {
      const mostUsedLocation = behavior.recentLocations[0]
      if (mostUsedLocation.count > 3) {
        suggestions.push({
          type: 'location_focus',
          title: `${mostUsedLocation.name} er populært`,
          description: `Du har lagt til ${mostUsedLocation.count} ting der nylig`,
          action: 'Se alle ting der',
          icon: '📍'
        })
      }
    }

    // Category-based suggestions
    if (behavior.topCategories.length > 0) {
      const topCategory = behavior.topCategories[0]
      if (topCategory.count > 5) {
        suggestions.push({
          type: 'category_focus',
          title: `${topCategory.name} samling`,
          description: `Du har ${topCategory.count} ting i denne kategorien`,
          action: 'Se alle',
          icon: '📦'
        })
      }
    }

    // Seasonal suggestions (simplified)
    const currentMonth = new Date().getMonth()
    if (currentMonth >= 9 || currentMonth <= 2) { // Fall/Winter
      suggestions.push({
        type: 'seasonal',
        title: 'Vinterklær',
        description: 'Organiser vinterklær og utstyr',
        action: 'Legg til klær',
        icon: '❄️'
      })
    }

    // Quick actions based on recent activity
    const recentItemTypes = recentItems.slice(0, 5).map(item => item.category?.name).filter(Boolean)
    if (recentItemTypes.includes('Garn') || recentItemTypes.includes('Strikking')) {
      suggestions.push({
        type: 'related',
        title: 'Strikkeprosjekt',
        description: 'Du har nylig lagt til strikkeutstyr',
        action: 'Legg til garn',
        icon: '🧶'
      })
    }

    return {
      suggestedActions: suggestions.slice(0, 3), // Max 3 suggestions
      quickStats: {
        mostUsedCategory: behavior.topCategories[0]?.name || null,
        mostActiveLocation: behavior.recentLocations[0]?.name || null,
        itemsThisWeek: recentItems.filter(item =>
          item.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      }
    }
  }

  // Natural language search with contextual understanding
  async naturalLanguageSearch(query: string, context?: string, userId?: string): Promise<any[]> {
    if (!this.isEnabled) {
      return []
    }

    try {
      // Get user's inventory data for context
      const [items, locations, categories] = await Promise.all([
        db.item.findMany({
          where: { userId },
          include: {
            location: true,
            category: true,
            distributions: true
          },
          take: 100
        }),
        db.location.findMany({
          where: { userId },
          take: 50
        }),
        db.category.findMany({
          take: 50
        })
      ])

      // Create a comprehensive context for the AI
      const inventoryContext = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          location: item.location?.name,
          category: item.category?.name,
          quantity: item.totalQuantity,
          createdAt: item.createdAt
        })),
        locations: locations.map(loc => ({
          id: loc.id,
          name: loc.name,
          type: loc.type
        })),
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name
        })),
        currentTime: new Date().toISOString(),
        recentActivity: await db.activity.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            type: true,
            description: true,
            createdAt: true
          }
        })
      }

      const prompt = `
Analyser følgende naturlig språk søk og finn relevante gjenstander:

Søk: "${query}"
Kontekst: "${context || 'Generelt søk'}"

Brukerens inventar:
${JSON.stringify(inventoryContext, null, 2)}

Regler for søk:
1. Forstå kontekst og intensjon i søket
2. Finn relevante gjenstander basert på:
   - Navn, beskrivelse, kategori
   - Lokasjon og tilgjengelighet
   - Tidspunkt (f.eks. "siste", "nye")
   - Mengde og status
3. Rangér resultater etter relevans
4. Inkluder forklaring for hvorfor resultatet er relevant
5. Returner maks 10 resultater

Eksempler:
- "hvor er mine røde sokker?" → Søk etter sokker i rødt
- "hva har jeg i kjøleskapet?" → Finn alle gjenstander i kjøkken/kjøleskap
- "nye ting denne måneden" → Nylig registrerte gjenstander
- "strikketøy i stuen" → Garn/ull i stue-lokasjoner

Format: JSON-array med objekter som inneholder id, navn, beskrivelse, lokasjon, kategori, relevans-score og forklaring.
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du er en intelligent søkeassistent for et inventarsystem. Du forstår naturlig språk og kan finne relevante gjenstander basert på kontekst og brukerens intensjon.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        return []
      }

      try {
        const searchResults = JSON.parse(content)
        if (!Array.isArray(searchResults)) {
          return []
        }

        // Enrich results with actual item data
        return searchResults.map(result => {
          const item = items.find(i => i.id === result.id)
          if (item) {
            return {
              id: item.id,
              type: 'item',
              name: item.name,
              description: item.description,
              categoryName: item.category?.name,
              locationName: item.location?.name,
              quantity: item.totalQuantity,
              price: item.estimatedValue,
              _formatted: {
                name: `<mark>${item.name}</mark>`,
                description: item.description
              },
              relevanceScore: result.relevanceScore || 0.8,
              explanation: result.explanation || 'Relevant søketreff'
            }
          }
          return result
        }).filter(result => result.id)
      } catch (parseError) {
        console.error('Failed to parse natural language search results:', parseError)
        return []
      }
    } catch (error) {
      console.error('Natural language search failed:', error)
      return []
    }
  }

  // Export singleton instance
}

export const aiService = new AIService()

