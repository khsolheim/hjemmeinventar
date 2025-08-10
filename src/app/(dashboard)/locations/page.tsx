'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  MapPin, 
  QrCode, 
  Search, 
  MoreVertical,
  Home,
  Package,
  Archive,
  Folder,
  FileText,
  Printer
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mock data for demonstration
const mockLocations = [
  {
    id: '1',
    name: 'Kjøkken',
    type: 'ROOM',
    qrCode: 'KJK-0001',
    description: 'Hovedkjøkken i første etasje',
    itemCount: 12,
    children: [
      {
        id: '2',
        name: 'Kjøkkenskap øverst til høyre',
        type: 'CABINET',
        qrCode: 'KJK-0002',
        itemCount: 8
      },
      {
        id: '3', 
        name: 'Kjøleskap',
        type: 'CONTAINER',
        qrCode: 'KJK-0003',
        itemCount: 4
      }
    ]
  },
  {
    id: '4',
    name: 'Soverom',
    type: 'ROOM', 
    qrCode: 'SOV-0001',
    description: 'Hovedsoverom andre etasje',
    itemCount: 6,
    children: []
  },
  {
    id: '5',
    name: 'Bod',
    type: 'ROOM',
    qrCode: 'BOD-0001', 
    description: 'Oppbevaring på loftet',
    itemCount: 24,
    children: [
      {
        id: '6',
        name: 'Plastboks A',
        type: 'BOX',
        qrCode: 'BOD-0002',
        itemCount: 12
      },
      {
        id: '7',
        name: 'Plastboks B', 
        type: 'BOX',
        qrCode: 'BOD-0003',
        itemCount: 12
      }
    ]
  }
]

const locationTypeIcons = {
  ROOM: Home,
  SHELF: Package,
  BOX: Archive,
  CONTAINER: Package,
  DRAWER: Folder,
  CABINET: FileText
}

const locationTypeLabels = {
  ROOM: 'Rom',
  SHELF: 'Hylle',
  BOX: 'Boks',
  CONTAINER: 'Beholder',
  DRAWER: 'Skuff',
  CABINET: 'Skap'
}

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'ROOM',
    description: '',
    parentId: ''
  })

  const filteredLocations = mockLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || location.type === selectedType
    return matchesSearch && matchesType
  })

  const handleCreateLocation = () => {
    // For now, just show a success message and close form
    console.log('Creating location:', newLocation)
    setShowCreateForm(false)
    setNewLocation({ name: '', type: 'ROOM', description: '', parentId: '' })
  }

  const LocationIcon = ({ type }: { type: string }) => {
    const Icon = locationTypeIcons[type as keyof typeof locationTypeIcons] || MapPin
    return <Icon className="w-4 h-4" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lokasjoner</h1>
          <p className="text-muted-foreground">
            Administrer rom, hyller og oppbevaringssteder
          </p>
        </div>
        <AccessibleButton 
          onClick={() => setShowCreateForm(true)}
          aria-label="Opprett ny lokasjon"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ny lokasjon
        </AccessibleButton>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Søk etter lokasjoner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Søk i lokasjoner"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer etter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle typer</SelectItem>
            <SelectItem value="ROOM">Rom</SelectItem>
            <SelectItem value="SHELF">Hylle</SelectItem>
            <SelectItem value="BOX">Boks</SelectItem>
            <SelectItem value="CONTAINER">Beholder</SelectItem>
            <SelectItem value="DRAWER">Skuff</SelectItem>
            <SelectItem value="CABINET">Skap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Location Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Opprett ny lokasjon</CardTitle>
            <CardDescription>
              Legg til et nytt rom eller oppbevaringssted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location-name">Navn på lokasjon</Label>
                <Input
                  id="location-name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  placeholder="F.eks. Kjøkken, Soverom, Plastboks A"
                />
              </div>
              <div>
                <Label htmlFor="location-type">Type</Label>
                <Select value={newLocation.type} onValueChange={(value) => setNewLocation({...newLocation, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROOM">Rom</SelectItem>
                    <SelectItem value="SHELF">Hylle</SelectItem>
                    <SelectItem value="BOX">Boks</SelectItem>
                    <SelectItem value="CONTAINER">Beholder</SelectItem>
                    <SelectItem value="DRAWER">Skuff</SelectItem>
                    <SelectItem value="CABINET">Skap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="location-description">Beskrivelse (valgfritt)</Label>
              <Input
                id="location-description"
                value={newLocation.description}
                onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
                placeholder="Tilleggsinformasjon om lokasjonen"
              />
            </div>
            <div className="flex gap-2">
              <AccessibleButton onClick={handleCreateLocation} aria-label="Lagre ny lokasjon">
                Opprett lokasjon
              </AccessibleButton>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                aria-label="Avbryt opprettelse av lokasjon"
              >
                Avbryt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location) => (
          <Card key={location.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LocationIcon type={location.type} />
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                </div>
                <Button variant="ghost" size="sm" aria-label={`Mer handlinger for ${location.name}`}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {locationTypeLabels[location.type as keyof typeof locationTypeLabels]}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <QrCode className="w-3 h-3" />
                  {location.qrCode}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {location.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {location.description}
                </p>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">
                  {location.itemCount} gjenstander
                </span>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Printer className="w-3 h-3" />
                  Skriv ut QR
                </Button>
              </div>

              {location.children && location.children.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Underlokasjoner:</h4>
                  <div className="space-y-2">
                    {location.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <LocationIcon type={child.type} />
                          <span className="text-sm">{child.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {child.qrCode}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {child.itemCount} ting
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? 'Ingen lokasjoner funnet' : 'Ingen lokasjoner ennå'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {searchQuery 
              ? `Prøv å endre søket ditt eller filteret` 
              : 'Begynn med å opprette ditt første rom eller oppbevaringssted'
            }
          </p>
          {!searchQuery && (
            <AccessibleButton 
              onClick={() => setShowCreateForm(true)}
              aria-label="Opprett din første lokasjon"
            >
              <Plus className="w-4 h-4 mr-2" />
              Opprett første lokasjon
            </AccessibleButton>
          )}
        </div>
      )}
    </div>
  )
}
