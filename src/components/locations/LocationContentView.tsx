'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Package, 
  Archive, 
  Home, 
  Folder, 
  FileText, 
  ShoppingBag,
  Square,
  Plus,
  ArrowLeft
} from 'lucide-react'
import { SmartLocationSuggestions } from './SmartLocationSuggestions'
import { buildLocationPath, buildCompactPath, formatLocationDisplay, type LocationWithPath } from '@/lib/utils/location-path'

const locationTypeIcons = {
  ROOM: Home,
  CABINET: Package,
  RACK: Package,
  WALL_SHELF: Square,
  SHELF: Folder,
  BOX: Archive,
  CONTAINER: Archive,
  DRAWER: Folder,
  SHELF_COMPARTMENT: Square,
  BAG: ShoppingBag,
  SECTION: FileText
}

interface LocationContentViewProps {
  currentLocation: any | null
  childLocations: any[]
  items: any[]
  allLocations?: any[] // For building paths
  onNavigateToLocation: (locationId: string) => void
  onNavigateUp: () => void
  onCreateLocation: (parentId?: string) => void
  onCreateSmartLocation: (suggestion: { name: string; type: string; parentId: string }) => void
  onEditLocation: (location: any) => void
}

export function LocationContentView({
  currentLocation,
  childLocations,
  items,
  allLocations = [],
  onNavigateToLocation,
  onNavigateUp,
  onCreateLocation,
  onCreateSmartLocation,
  onEditLocation
}: LocationContentViewProps) {
  const LocationIcon = ({ type }: { type: string }) => {
    const Icon = locationTypeIcons[type as keyof typeof locationTypeIcons] || MapPin
    return <Icon className="w-4 h-4" />
  }

  const getLocationTypeLabel = (type: string) => {
    const labels = {
      ROOM: 'Rom',
      CABINET: 'Skap',
      RACK: 'Reol',
      WALL_SHELF: 'Vegghengt hylle',
      SHELF: 'Hylle',
      BOX: 'Boks',
      CONTAINER: 'Beholder',
      DRAWER: 'Skuff',
      SHELF_COMPARTMENT: 'Hyllefag',
      BAG: 'Pose',
      SECTION: 'Seksjon'
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="space-y-6">
      {/* Current Location Header */}
      {currentLocation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LocationIcon type={currentLocation.type} />
                <div>
                  <CardTitle className="text-xl">{currentLocation.name}</CardTitle>
                  {/* Vis full lokasjonsstier */}
                  {allLocations.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      📍 {buildLocationPath(currentLocation as LocationWithPath, allLocations as LocationWithPath[])}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {getLocationTypeLabel(currentLocation.type)} • QR: <span className="font-mono">{currentLocation.qrCode}</span>
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onNavigateUp}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tilbake
              </Button>
            </div>
          </CardHeader>
          {currentLocation.description && (
            <CardContent>
              <p className="text-muted-foreground">{currentLocation.description}</p>
            </CardContent>
          )}
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{childLocations.length}</div>
            <p className="text-xs text-muted-foreground">Under-lokasjoner</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">Gjenstander</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{childLocations.length + items.length}</div>
            <p className="text-xs text-muted-foreground">Totalt innhold</p>
          </CardContent>
        </Card>
      </div>

      {/* Child Locations */}
      {childLocations.length > 0 && currentLocation && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Under-lokasjoner</h3>
            <SmartLocationSuggestions
              currentLocation={currentLocation}
              existingChildLocations={childLocations}
              onCreateSuggestion={onCreateSmartLocation}
              onCreateCustom={() => onCreateLocation(currentLocation?.id)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {childLocations.map((location) => (
              <Card 
                key={location.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onNavigateToLocation(location.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LocationIcon type={location.type} />
                      <CardTitle className="text-base">{location.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getLocationTypeLabel(location.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {location.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {location.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{location.itemCount || 0} gjenstander</span>
                    <span>QR: {location.qrCode}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Items in Current Location */}
      {items.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Gjenstander {currentLocation ? `i ${currentLocation.name}` : 'uten lokasjon'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {item.category && <span>{item.category.name}</span>}
                    {item.price && <span>{item.price} kr</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {childLocations.length === 0 && items.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {currentLocation ? 'Ingen innhold' : 'Ingen lokasjoner'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {currentLocation 
                ? `${currentLocation.name} er tom. Legg til under-lokasjoner eller gjenstander.`
                : 'Begynn med å opprette ditt første rom eller oppbevaringssted.'
              }
            </p>
            {currentLocation ? (
              <SmartLocationSuggestions
                currentLocation={currentLocation}
                existingChildLocations={[]}
                onCreateSuggestion={onCreateSmartLocation}
                onCreateCustom={() => onCreateLocation(currentLocation?.id)}
              />
            ) : (
              <Button onClick={() => onCreateLocation(currentLocation?.id)}>
                <Plus className="w-4 h-4 mr-2" />
                Opprett første lokasjon
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Show suggestions when there are no child locations but there are items */}
      {childLocations.length === 0 && items.length > 0 && currentLocation && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Legg til under-lokasjoner</h3>
          <SmartLocationSuggestions
            currentLocation={currentLocation}
            existingChildLocations={[]}
            onCreateSuggestion={onCreateSmartLocation}
            onCreateCustom={() => onCreateLocation(currentLocation?.id)}
          />
        </div>
      )}
    </div>
  )
}
