'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { 
  Lightbulb,
  Plus,
  Home,
  Package,
  Archive,
  Folder,
  FileText,
  ShoppingBag,
  Square,
  Layers
} from 'lucide-react'
import { LocationType } from '@prisma/client'

const locationTypeIcons = {
  ROOM: Home,
  CABINET: Package,
  RACK: Package,
  WALL_SHELF: Square,
  SHELF: Folder,
  DRAWER: FileText,
  BOX: Archive,
  BAG: ShoppingBag,
  CONTAINER: Package,
  SHELF_COMPARTMENT: Layers,
  SECTION: Square
}

const locationTypeLabels = {
  ROOM: 'Rom',
  CABINET: 'Skap',
  RACK: 'Reol',
  WALL_SHELF: 'Vegghengt hylle',
  SHELF: 'Hylle',
  DRAWER: 'Skuff',
  BOX: 'Boks',
  BAG: 'Pose',
  CONTAINER: 'Beholder',
  SHELF_COMPARTMENT: 'Hylle',
  SECTION: 'Avsnitt'
}

// Smart suggestions mapping - mest logiske under-lokasjoner for hver type
const SMART_SUGGESTIONS: Record<LocationType, Array<{type: LocationType, priority: number, defaultName: string}>> = {
  ROOM: [
    { type: 'CABINET', priority: 1, defaultName: 'Skap' },
    { type: 'RACK', priority: 2, defaultName: 'Reol' },
    { type: 'DRAWER', priority: 3, defaultName: 'Skuff' }
  ],
  CABINET: [
    { type: 'SHELF', priority: 1, defaultName: 'Hylle' },
    { type: 'DRAWER', priority: 2, defaultName: 'Skuff' },
    { type: 'BOX', priority: 3, defaultName: 'Boks' }
  ],
  RACK: [
    { type: 'SHELF', priority: 1, defaultName: 'Hylle' },
    { type: 'BOX', priority: 2, defaultName: 'Boks' },
    { type: 'SECTION', priority: 3, defaultName: 'Avsnitt' }
  ],
  SHELF: [
    { type: 'BOX', priority: 1, defaultName: 'Boks' },
    { type: 'BAG', priority: 2, defaultName: 'Pose' },
    { type: 'SECTION', priority: 3, defaultName: 'Avsnitt' }
  ],
  WALL_SHELF: [
    { type: 'BOX', priority: 1, defaultName: 'Boks' },
    { type: 'BAG', priority: 2, defaultName: 'Pose' },
    { type: 'SECTION', priority: 3, defaultName: 'Avsnitt' }
  ],
  DRAWER: [
    { type: 'SECTION', priority: 1, defaultName: 'Avsnitt' },
    { type: 'BAG', priority: 2, defaultName: 'Pose' },
    { type: 'BOX', priority: 3, defaultName: 'Liten boks' }
  ],
  BOX: [
    { type: 'BAG', priority: 1, defaultName: 'Pose' },
    { type: 'SECTION', priority: 2, defaultName: 'Avsnitt' }
  ],
  BAG: [], // Poser har vanligvis ikke under-lokasjoner
  CONTAINER: [
    { type: 'BAG', priority: 1, defaultName: 'Pose' },
    { type: 'SECTION', priority: 2, defaultName: 'Avsnitt' },
    { type: 'BOX', priority: 3, defaultName: 'Boks' }
  ],
  SHELF_COMPARTMENT: [
    { type: 'BOX', priority: 1, defaultName: 'Boks' },
    { type: 'BAG', priority: 2, defaultName: 'Pose' }
  ],
  SECTION: [
    { type: 'BAG', priority: 1, defaultName: 'Pose' }
  ]
}

interface SmartLocationSuggestionsProps {
  currentLocation: {
    id: string
    name: string
    type: LocationType
  } | null
  existingChildLocations: Array<{
    name: string
    type: LocationType
  }>
  onCreateSuggestion: (suggestion: {
    name: string
    type: LocationType
    parentId: string
  }) => void
  onCreateCustom: () => void
}

export function SmartLocationSuggestions({
  currentLocation,
  existingChildLocations,
  onCreateSuggestion,
  onCreateCustom
}: SmartLocationSuggestionsProps) {
  // Early return hvis currentLocation er null
  if (!currentLocation) {
    return (
      <Button 
        onClick={onCreateCustom} 
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white dark:text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ny lokasjon
      </Button>
    )
  }

  const suggestions = SMART_SUGGESTIONS[currentLocation.type] || []
  
  // Generer smarte navn basert på eksisterende lokasjoner
  const generateSmartName = (suggestion: typeof suggestions[0]): string => {
    const existingOfType = existingChildLocations.filter(loc => loc.type === suggestion.type)
    
    if (existingOfType.length === 0) {
      return suggestion.defaultName
    }
    
    // Finn høyeste nummer for denne typen
    let highestNumber = 0
    existingOfType.forEach(loc => {
      const match = loc.name.match(new RegExp(`${suggestion.defaultName}\\s*(\\d+)?`))
      if (match) {
        const num = match[1] ? parseInt(match[1]) : 1
        if (num > highestNumber) {
          highestNumber = num
        }
      }
    })
    
    return `${suggestion.defaultName} ${highestNumber + 1}`
  }

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    const smartName = generateSmartName(suggestion)
    onCreateSuggestion({
      name: smartName,
      type: suggestion.type,
      parentId: currentLocation!.id // Vi vet at currentLocation ikke er null her pga early return
    })
  }

  if (suggestions.length === 0) {
    // Hvis ingen forslag, vis bare vanlig "Ny lokasjon" knapp
    return (
      <Button 
        onClick={onCreateCustom} 
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white dark:text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ny lokasjon
      </Button>
    )
  }

  const LocationIcon = ({ type }: { type: LocationType }) => {
    const Icon = locationTypeIcons[type] || Package
    return <Icon className="w-4 h-4" />
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Lightbulb className="w-4 h-4" />
        Vanlige under-lokasjoner for {locationTypeLabels[currentLocation!.type]}:
      </div>
      
      {/* Suggestion Buttons */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => {
          const smartName = generateSmartName(suggestion)
          return (
            <Button
              key={`${suggestion.type}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 h-auto py-2 px-3 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white dark:text-white"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">{smartName}</span>
            </Button>
          )
        })}
        
        {/* Custom location button */}
        <Button
          onClick={onCreateCustom}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 h-auto py-2 px-3 bg-gray-600 hover:bg-gray-700 border-gray-600 hover:border-gray-700 text-white dark:text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Egendefinert</span>
        </Button>
      </div>
    </div>
  )
}
