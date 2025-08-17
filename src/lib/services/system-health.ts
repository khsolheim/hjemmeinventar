import { type PrismaClient } from '@prisma/client'

export class SystemHealthService {
  private db: PrismaClient

  constructor(db: PrismaClient) {
    this.db = db
  }

  async checkYarnSystemRequirements(userId: string): Promise<{
    ready: boolean
    issues: string[]
    fixes: string[]
  }> {
    const issues: string[] = []
    const fixes: string[] = []

    try {
      // Check 1: Garn Master kategori
      const garnCategory = await this.db.category.findFirst({
        where: { name: 'Garn Master' }
      })
      if (!garnCategory) {
        issues.push('Mangler "Garn Master" kategori')
        fixes.push('Kategori vil bli auto-opprettet ved første bruk')
      }

      // Check 2: User locations
      const userLocations = await this.db.location.findMany({
        where: { userId },
        take: 1
      })
      if (userLocations.length === 0) {
        issues.push('Ingen lokasjoner funnet for bruker')
        fixes.push('Standard lokasjon vil bli auto-opprettet ved første bruk')
      }

      // Check 3: User exists and is active
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { isActive: true, email: true }
      })
      if (!user) {
        issues.push('Bruker ikke funnet')
        fixes.push('Kontakt systemadministrator')
      } else if (!user.isActive) {
        issues.push('Brukerkonto er deaktivert')
        fixes.push('Kontakt systemadministrator')
      }

      return {
        ready: issues.length === 0,
        issues,
        fixes
      }
    } catch (error) {
      return {
        ready: false,
        issues: [`Database feil: ${error instanceof Error ? error.message : 'Ukjent feil'}`],
        fixes: ['Sjekk database tilkobling']
      }
    }
  }

  async initializeUserDefaults(userId: string): Promise<void> {
    try {
      // Create default categories if missing
      const requiredCategories = [
        {
          name: 'Garn Master',
          description: 'Master-kategori for garntyper',
          icon: '🧶',
          fieldSchema: {
            type: 'object',
            properties: {
              fiberContent: { type: 'string', title: 'Fiberinnhold' },
              weight: { type: 'string', title: 'Garntykkelse' },
              yardage: { type: 'number', title: 'Lengde (meter)' },
              gauge: { type: 'string', title: 'Strikkefasthet' },
              needleSize: { type: 'string', title: 'Pinner størrelse' },
              careInstructions: { type: 'string', title: 'Vaskeinstruksjoner' },
              brand: { type: 'string', title: 'Merke' },
              colorway: { type: 'string', title: 'Fargenavn' },
              lotNumber: { type: 'string', title: 'Partinummer' }
            },
            required: ['fiberContent', 'weight']
          }
        },
        {
          name: 'Garn Batch',
          description: 'Batch/parti av garn',
          icon: '🧶',
          fieldSchema: {
            type: 'object',
            properties: {
              colorName: { type: 'string', title: 'Fargenavn' },
              lotNumber: { type: 'string', title: 'Partinummer' },
              quantity: { type: 'number', title: 'Antall' },
              weight: { type: 'number', title: 'Vekt (gram)' }
            },
            required: ['colorName', 'quantity']
          }
        }
      ]

      for (const category of requiredCategories) {
        const existing = await this.db.category.findFirst({
          where: { name: category.name }
        })
        
        if (!existing) {
          await this.db.category.create({
            data: {
              ...category,
              fieldSchema: JSON.stringify(category.fieldSchema)
            }
          })
          console.log(`✅ Created category: ${category.name}`)
        }
      }

      // Create default location if none exists
      const userLocations = await this.db.location.findMany({
        where: { userId },
        take: 1
      })

      if (userLocations.length === 0) {
        await this.db.location.create({
          data: {
            name: 'Hovedlager',
            description: 'Standard oppbevaringslokasjon',
            type: 'ROOM',
            qrCode: `location-${userId}-main-${Date.now()}`,
            userId
          }
        })
        console.log('✅ Created default location: Hovedlager')
      }

    } catch (error) {
      console.error('❌ Failed to initialize user defaults:', error)
      throw error
    }
  }
}
