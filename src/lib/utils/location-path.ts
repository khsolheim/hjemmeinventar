import { LocationType } from '@prisma/client'

export interface LocationWithPath {
  id: string
  name: string
  type: LocationType
  parentId?: string | null
  qrCode: string
  parent?: LocationWithPath | null
  children?: LocationWithPath[]
}

/**
 * Bygger full lokasjonsstier fra rot til blad
 * Eksempel: "Stue › Skap 1 › Boks A"
 */
export function buildLocationPath(location: LocationWithPath, allLocations: LocationWithPath[]): string {
  const path: string[] = []
  let current: LocationWithPath | undefined = location
  
  // Bygg stien baklengs fra current til rot
  while (current) {
    path.unshift(current.name)
    
    if (current.parentId) {
      current = allLocations.find(loc => loc.id === current!.parentId)
    } else {
      current = undefined
    }
  }
  
  return path.join(' › ')
}

/**
 * Bygger forkortet sti for kompakt visning
 * Eksempel: "Stue › ... › Boks A" eller "Skap 1 › Boks A"
 */
export function buildCompactPath(location: LocationWithPath, allLocations: LocationWithPath[], maxSegments: number = 3): string {
  const fullPath = buildLocationPath(location, allLocations)
  const segments = fullPath.split(' › ')
  
  if (segments.length <= maxSegments) {
    return fullPath
  }
  
  // Vis første, "..." og siste segmenter
  const first = segments[0]
  const last = segments[segments.length - 1]
  
  if (maxSegments === 2) {
    return `${first} › ${last}`
  }
  
  return `${first} › ... › ${last}`
}

/**
 * Genererer kort, lesbar QR-kode
 * Format: LOC001, LOC002, etc.
 */
export function generateLocationQRCode(sequence: number): string {
  return `LOC${sequence.toString().padStart(3, '0')}`
}

/**
 * Bygger hierarkisk breadcrumb-struktur
 */
export function buildBreadcrumbs(location: LocationWithPath, allLocations: LocationWithPath[]): Array<{
  id: string
  name: string
  type: LocationType
}> {
  const breadcrumbs: Array<{ id: string; name: string; type: LocationType }> = []
  let current: LocationWithPath | undefined = location
  
  while (current) {
    breadcrumbs.unshift({
      id: current.id,
      name: current.name,
      type: current.type
    })
    
    if (current.parentId) {
      current = allLocations.find(loc => loc.id === current!.parentId)
    } else {
      current = undefined
    }
  }
  
  return breadcrumbs
}

/**
 * Finner alle barn (rekursivt) av en lokasjon
 */
export function findAllChildren(locationId: string, allLocations: LocationWithPath[]): LocationWithPath[] {
  const children: LocationWithPath[] = []
  
  function collectChildren(parentId: string) {
    const directChildren = allLocations.filter(loc => loc.parentId === parentId)
    
    for (const child of directChildren) {
      children.push(child)
      collectChildren(child.id) // Rekursivt
    }
  }
  
  collectChildren(locationId)
  return children
}

/**
 * Sjekker om en lokasjon kan flyttes til en ny forelder
 * (forhindrer sykliske referanser)
 */
export function canMoveLocation(
  locationId: string, 
  newParentId: string, 
  allLocations: LocationWithPath[]
): boolean {
  // Kan ikke flytte til seg selv
  if (locationId === newParentId) {
    return false
  }
  
  // Kan ikke flytte til et av sine egne barn (ville skape syklus)
  const allChildren = findAllChildren(locationId, allLocations)
  const childIds = allChildren.map(child => child.id)
  
  return !childIds.includes(newParentId)
}

/**
 * Formaterer lokasjon for visning med sti
 */
export function formatLocationDisplay(
  location: LocationWithPath, 
  allLocations: LocationWithPath[],
  format: 'full' | 'compact' | 'name-only' = 'compact'
): string {
  switch (format) {
    case 'full':
      return buildLocationPath(location, allLocations)
    case 'compact':
      return buildCompactPath(location, allLocations)
    case 'name-only':
      return location.name
    default:
      return buildCompactPath(location, allLocations)
  }
}

/**
 * Søker i lokasjoner basert på sti eller navn
 */
export function searchLocations(
  query: string, 
  allLocations: LocationWithPath[]
): LocationWithPath[] {
  const lowerQuery = query.toLowerCase()
  
  return allLocations.filter(location => {
    // Søk i navn
    if (location.name.toLowerCase().includes(lowerQuery)) {
      return true
    }
    
    // Søk i QR-kode
    if (location.qrCode.toLowerCase().includes(lowerQuery)) {
      return true
    }
    
    // Søk i full sti
    const fullPath = buildLocationPath(location, allLocations)
    if (fullPath.toLowerCase().includes(lowerQuery)) {
      return true
    }
    
    return false
  })
}
