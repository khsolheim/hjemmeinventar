import { LocationType } from '@prisma/client'
import { db } from '@/lib/db'

export interface AutoNamingOptions {
  parentId?: string
  type: LocationType
  userId: string
  customPrefix?: string
}

export interface AutoNamingResult {
  name: string
  autoNumber: string
  level: number
  wizardOrder: number
}

/**
 * AutoNamingService - Automatisk navngivning for wizard lokasjoner
 * 
 * Implementerer logisk alfanumerisk navngivingssystem:
 * - Rom: Bruker-oppgitt navn
 * - Skap i rom: Skap A, Skap B, Skap C...
 * - Hyller i skap: A1, A2, A3... (for Skap A), B1, B2, B3... (for Skap B)
 * - Bokser på hylle: A1-1, A1-2, A1-3... (for Hylle A1)
 * - Poser i boks: A1-1-a, A1-1-b, A1-1-c... (for Boks A1-1)
 */
export class AutoNamingService {
  
  /**
   * Generer automatisk navn for ny lokasjon
   */
  static async generateName(options: AutoNamingOptions): Promise<AutoNamingResult> {
    const { parentId, type, userId, customPrefix } = options
    
    // Bestem level basert på parent
    const level = await this.calculateLevel(parentId, userId)
    
    // Hent eksisterende siblings for å finne neste nummer/bokstav
    const siblings = await this.getSiblingLocations(parentId, type, userId)
    
    // Generer autoNumber basert på type og level
    const autoNumber = await this.generateAutoNumber(parentId, type, siblings, userId, customPrefix)
    
    // Generer fullt navn
    const name = this.generateFullName(type, autoNumber, level)
    
    // Beregn wizard order
    const wizardOrder = siblings.length + 1
    
    return {
      name,
      autoNumber,
      level,
      wizardOrder
    }
  }
  
  /**
   * Beregn level basert på parent hierarki
   */
  private static async calculateLevel(parentId?: string, userId?: string): Promise<number> {
    if (!parentId) return 0 // Root level (Rom)
    
    const parent = await db.location.findUnique({
      where: { id: parentId },
      select: { level: true }
    })
    
    return (parent?.level ?? 0) + 1
  }
  
  /**
   * Hent sibling lokasjoner for å finne neste nummer
   */
  private static async getSiblingLocations(
    parentId: string | undefined, 
    type: LocationType, 
    userId: string
  ) {
    return await db.location.findMany({
      where: {
        parentId,
        type,
        userId,
        isActive: true
      },
      select: {
        autoNumber: true,
        wizardOrder: true,
        name: true
      },
      orderBy: { wizardOrder: 'asc' }
    })
  }
  
  /**
   * Generer autoNumber basert på type og hierarki
   */
  private static async generateAutoNumber(
    parentId: string | undefined,
    type: LocationType,
    siblings: any[],
    userId: string,
    customPrefix?: string
  ): Promise<string> {
    
    if (type === LocationType.ROOM) {
      // Rom bruker ikke autoNumber (bruker-oppgitt navn)
      return ''
    }
    
    // Hent parent autoNumber for sammensatte nummer
    let parentAutoNumber = ''
    if (parentId) {
      const parent = await db.location.findUnique({
        where: { id: parentId },
        select: { autoNumber: true, type: true }
      })
      parentAutoNumber = parent?.autoNumber || ''
    }
    
    switch (type) {
      case LocationType.CABINET:
      case LocationType.RACK:
      case LocationType.WALL_SHELF:
        // Skap/Reol: A, B, C...
        return this.getNextLetter(siblings)
        
      case LocationType.SHELF:
      case LocationType.DRAWER:
        // Hylle/Skuff: A1, A2, A3... (for Skap A)
        const shelfNumber = this.getNextNumber(siblings)
        return `${parentAutoNumber}${shelfNumber}`
        
      case LocationType.BOX:
        // Boks: A1-1, A1-2, A1-3... (for Hylle A1)
        const boxNumber = this.getNextNumber(siblings)
        return `${parentAutoNumber}-${boxNumber}`
        
      case LocationType.BAG:
        // Pose: A1-1-a, A1-1-b, A1-1-c... (for Boks A1-1)
        const bagLetter = this.getNextLetter(siblings, true) // lowercase
        return `${parentAutoNumber}-${bagLetter}`
        
      default:
        // Fallback: bruk nummer
        return this.getNextNumber(siblings).toString()
    }
  }
  
  /**
   * Finn neste tilgjengelige bokstav (A, B, C...)
   */
  private static getNextLetter(siblings: any[], lowercase = false): string {
    const usedLetters = siblings
      .map(s => s.autoNumber)
      .filter(Boolean)
      .map(num => {
        // Ekstrahér bokstav fra autoNumber
        const match = num.match(/^([A-Za-z])/)
        return match ? match[1].toUpperCase() : null
      })
      .filter(Boolean)
    
    // Finn neste tilgjengelige bokstav
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i) // A, B, C...
      if (!usedLetters.includes(letter)) {
        return lowercase ? letter.toLowerCase() : letter
      }
    }
    
    // Hvis alle bokstaver er brukt, start på AA, BB, CC...
    return lowercase ? 'aa' : 'AA'
  }
  
  /**
   * Finn neste tilgjengelige nummer (1, 2, 3...)
   */
  private static getNextNumber(siblings: any[]): number {
    const usedNumbers = siblings
      .map(s => s.autoNumber)
      .filter(Boolean)
      .map(num => {
        // Ekstrahér siste nummer fra autoNumber
        const matches = num.match(/(\d+)(?!.*\d)/) // Siste nummer i strengen
        return matches ? parseInt(matches[1]) : null
      })
      .filter(n => n !== null)
      .sort((a, b) => a - b)
    
    // Finn neste tilgjengelige nummer
    for (let i = 1; i <= usedNumbers.length + 1; i++) {
      if (!usedNumbers.includes(i)) {
        return i
      }
    }
    
    return usedNumbers.length + 1
  }
  
  /**
   * Generer fullt navn basert på type og autoNumber
   */
  private static generateFullName(type: LocationType, autoNumber: string, level: number): string {
    const typeNames = {
      [LocationType.ROOM]: 'Rom',
      [LocationType.CABINET]: 'Skap',
      [LocationType.RACK]: 'Reol', 
      [LocationType.WALL_SHELF]: 'Vegghengt hylle',
      [LocationType.SHELF]: 'Hylle',
      [LocationType.DRAWER]: 'Skuff',
      [LocationType.BOX]: 'Boks',
      [LocationType.BAG]: 'Pose',
      [LocationType.CONTAINER]: 'Beholder',
      [LocationType.SHELF_COMPARTMENT]: 'Hylle',
      [LocationType.SECTION]: 'Avsnitt'
    }
    
    const typeName = typeNames[type] || 'Lokasjon'
    
    if (type === LocationType.ROOM || !autoNumber) {
      return typeName // Rom har ikke autoNumber
    }
    
    return `${typeName} ${autoNumber}`
  }
  
  /**
   * Valider at autoNumber er unikt innenfor parent scope
   */
  static async validateAutoNumber(
    autoNumber: string,
    parentId: string | undefined,
    userId: string,
    excludeId?: string
  ): Promise<boolean> {
    const existing = await db.location.findFirst({
      where: {
        autoNumber,
        parentId,
        userId,
        isActive: true,
        id: excludeId ? { not: excludeId } : undefined
      }
    })
    
    return !existing
  }
  
  /**
   * Generer neste tilgjengelige autoNumber for gitt scope
   */
  static async getNextAvailableAutoNumber(
    parentId: string | undefined,
    type: LocationType,
    userId: string
  ): Promise<string> {
    const siblings = await this.getSiblingLocations(parentId, type, userId)
    return await this.generateAutoNumber(parentId, type, siblings, userId)
  }
  
  /**
   * Hent hierarki-sti for en lokasjon (for breadcrumbs)
   */
  static async getLocationPath(locationId: string): Promise<Array<{id: string, name: string, type: LocationType}>> {
    const path: Array<{id: string, name: string, type: LocationType}> = []
    
    let currentId: string | null = locationId
    
    while (currentId) {
      const location = await db.location.findUnique({
        where: { id: currentId },
        select: {
          id: true,
          name: true,
          type: true,
          parentId: true
        }
      })
      
      if (!location) break
      
      path.unshift({
        id: location.id,
        name: location.name,
        type: location.type
      })
      
      currentId = location.parentId
    }
    
    return path
  }
  
  /**
   * Beregn tillatte child types for en gitt parent type
   */
  static getAllowedChildTypes(parentType?: LocationType): LocationType[] {
    if (!parentType) {
      // Root level - kun rom tillatt
      return [LocationType.ROOM]
    }
    
    const hierarchyRules: Record<LocationType, LocationType[]> = {
      [LocationType.ROOM]: [
        LocationType.CABINET, 
        LocationType.RACK, 
        LocationType.WALL_SHELF,
        LocationType.SHELF,
        LocationType.DRAWER
      ],
      [LocationType.CABINET]: [
        LocationType.SHELF, 
        LocationType.DRAWER, 
        LocationType.BOX
      ],
      [LocationType.RACK]: [
        LocationType.SHELF, 
        LocationType.BOX
      ],
      [LocationType.WALL_SHELF]: [
        LocationType.BOX, 
        LocationType.BAG
      ],
      [LocationType.SHELF]: [
        LocationType.BOX, 
        LocationType.BAG
      ],
      [LocationType.DRAWER]: [
        LocationType.BOX, 
        LocationType.BAG
      ],
      [LocationType.BOX]: [
        LocationType.BAG
      ],
      [LocationType.BAG]: [], // Leaf node
      [LocationType.CONTAINER]: [LocationType.BOX, LocationType.BAG],
      [LocationType.SHELF_COMPARTMENT]: [LocationType.BOX, LocationType.BAG],
      [LocationType.SECTION]: [LocationType.BOX, LocationType.BAG]
    }
    
    return hierarchyRules[parentType] || []
  }
  
  /**
   * Sjekk om en type kan plasseres under en parent type
   */
  static isValidPlacement(parentType: LocationType | undefined, childType: LocationType): boolean {
    const allowedTypes = this.getAllowedChildTypes(parentType)
    return allowedTypes.includes(childType)
  }
}