'use client'

import { LocationType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Package, 
  Archive, 
  Folder,
  ShoppingBag,
  FileText,
  BookOpen,
  Square,
  ArrowLeft
} from 'lucide-react'

interface LocationTypeOption {
  type: LocationType
  label: string
  description: string
  icon: any
  color: string
  bgColor: string
  level: number
  isRecommended?: boolean
}

interface LocationTypeSelectorProps {
  allowedTypes?: LocationType[]
  onSelect: (type: LocationType) => void
  onBack?: () => void
  currentLocation?: {
    name: string
    type: LocationType
  }
  title?: string
  description?: string
}

const locationTypeOptions: LocationTypeOption[] = [
  {
    type: LocationType.ROOM,
    label: 'Rom',
    description: 'Soverom, Kjøkken, Stue, etc.',
    icon: Home,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    level: 0,
    isRecommended: true
  },
  {
    type: LocationType.CABINET,
    label: 'Skap',
    description: 'Garderobe, kjøkkenskap, etc.',
    icon: Package,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    level: 1
  },
  {
    type: LocationType.RACK,
    label: 'Reol',
    description: 'Bokhylle, oppbevaringshylle',
    icon: BookOpen,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    level: 1
  },
  {
    type: LocationType.WALL_SHELF,
    label: 'Vegghengt hylle',
    description: 'Hylle montert på vegg',
    icon: Square,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    level: 1
  },
  {
    type: LocationType.SHELF,
    label: 'Hylle',
    description: 'Hylle i skap eller reol',
    icon: Folder,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    level: 2
  },
  {
    type: LocationType.DRAWER,
    label: 'Skuff',
    description: 'Skuff i skap eller kommode',
    icon: FileText,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200',
    level: 2
  },
  {
    type: LocationType.BOX,
    label: 'Boks',
    description: 'Oppbevaringsboks eller kasse',
    icon: Archive,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    level: 3
  },
  {
    type: LocationType.BAG,
    label: 'Pose',
    description: 'Pose eller bag for småting',
    icon: ShoppingBag,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-200',
    level: 4
  }
]

export function LocationTypeSelector({ 
  allowedTypes, 
  onSelect, 
  onBack, 
  currentLocation,
  title = "Hva vil du opprette?",
  description = "Velg type lokasjon du vil legge til"
}: LocationTypeSelectorProps) {
  
  // Filtrer tillatte typer
  const availableOptions = allowedTypes 
    ? locationTypeOptions.filter(option => allowedTypes.includes(option.type))
    : locationTypeOptions

  // Sorter med anbefalte først
  const sortedOptions = availableOptions.sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1
    if (!a.isRecommended && b.isRecommended) return 1
    return a.level - b.level
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          {onBack && (
            <div className="flex justify-start mb-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake
              </Button>
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-lg text-gray-600">{description}</p>
          
          {currentLocation && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
              <p className="text-sm text-blue-800">
                📍 Du er i: <span className="font-semibold">{currentLocation.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Type Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedOptions.map((option) => {
            const Icon = option.icon
            
            return (
              <Card
                key={option.type}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 ${option.bgColor}`}
                onClick={() => onSelect(option.type)}
              >
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto mb-2 p-3 bg-white rounded-full w-fit shadow-sm">
                    <Icon className={`h-8 w-8 ${option.color}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    {option.label}
                    {option.isRecommended && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        Anbefalt
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription className="text-sm text-gray-600">
                    {option.description}
                  </CardDescription>
                  <div className="mt-3 text-xs text-gray-500">
                    Level {option.level}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tips:</strong> Start med rom hvis du er ny, eller velg direkte det du trenger hvis du allerede har en struktur.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        {!allowedTypes && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">Eller hopp direkte til:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(LocationType.ROOM)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Home className="h-4 w-4 mr-1" />
                Nytt rom
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(LocationType.CABINET)}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                <Package className="h-4 w-4 mr-1" />
                Nytt skap
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(LocationType.BOX)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Archive className="h-4 w-4 mr-1" />
                Ny boks
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}