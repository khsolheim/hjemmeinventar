// Helper functions for working with location hierarchies

export interface LocationWithPath {
  id: string
  name: string
  type: string
  parentId?: string | null
  displayPath: string[]
  displayName: string
}

/**
 * Builds the full path from root to the specified location
 * @param locationId The ID of the location to get path for
 * @param allLocations Array of all available locations
 * @returns Array of location names from root to target
 */
export function getLocationPath(locationId: string, allLocations: any[]): string[] {
  const path: string[] = []
  let currentLoc = allLocations.find(loc => loc.id === locationId)
  
  // Prevent infinite loops by tracking visited locations
  const visited = new Set<string>()
  
  while (currentLoc && !visited.has(currentLoc.id)) {
    visited.add(currentLoc.id)
    path.unshift(currentLoc.name)
    
    if (currentLoc.parentId) {
      currentLoc = allLocations.find(loc => loc.id === currentLoc!.parentId)
    } else {
      break
    }
  }
  
  return path
}

/**
 * Enhances locations with display path and name for UI display
 * @param locations Array of locations to enhance
 * @returns Enhanced locations with displayPath and displayName
 */
export function enhanceLocationsWithPaths(locations: any[]): LocationWithPath[] {
  return locations.map(loc => ({
    ...loc,
    displayPath: getLocationPath(loc.id, locations),
    displayName: getLocationPath(loc.id, locations).join(' → ')
  }))
}

/**
 * Sorts locations by their display name (full path)
 * @param locations Array of enhanced locations
 * @returns Sorted array
 */
export function sortLocationsByPath(locations: LocationWithPath[]): LocationWithPath[] {
  return locations.sort((a, b) => a.displayName.localeCompare(b.displayName))
}

/**
 * Groups locations by their root parent
 * @param locations Array of enhanced locations
 * @returns Object with root location names as keys
 */
export function groupLocationsByRoot(locations: LocationWithPath[]): Record<string, LocationWithPath[]> {
  const grouped: Record<string, LocationWithPath[]> = {}
  
  locations.forEach(loc => {
    const rootName = loc.displayPath[0] || 'Rot-nivå'
    if (!grouped[rootName]) {
      grouped[rootName] = []
    }
    grouped[rootName].push(loc)
  })
  
  return grouped
}

/**
 * Gets a shortened display name for locations with very long paths
 * @param location Enhanced location
 * @param maxLength Maximum character length before truncating
 * @returns Shortened display name
 */
export function getShortDisplayName(location: LocationWithPath, maxLength: number = 50): string {
  const fullName = location.displayName
  
  if (fullName.length <= maxLength) {
    return fullName
  }
  
  // If too long, show first part + "..." + last part
  const parts = location.displayPath
  if (parts.length <= 2) {
    return fullName
  }
  
  const first = parts[0]
  const last = parts[parts.length - 1]
  return `${first} → ... → ${last}`
}

/**
 * Location type labels in Norwegian
 */
export const locationTypeLabels = {
  ROOM: 'Rom',
  SHELF: 'Reol',
  BOX: 'Boks',
  CONTAINER: 'Beholder',
  DRAWER: 'Skuff',
  CABINET: 'Skap',
  SHELF_COMPARTMENT: 'Hylle',
  BAG: 'Pose',
  SECTION: 'Avsnitt'
} as const
