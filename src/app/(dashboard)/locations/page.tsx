'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  Printer,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  Layers,
  ShoppingBag,
  Square
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

import { QRCodeCard } from '@/components/ui/qr-code'
import { DymoPrintDialog } from '@/components/printing/DymoPrintDialog'

const locationTypeIcons = {
  ROOM: Home,
  SHELF: Package,
  BOX: Archive,
  CONTAINER: Package,
  DRAWER: Folder,
  CABINET: FileText,
  SHELF_COMPARTMENT: Layers,
  BAG: ShoppingBag,
  SECTION: Square
}

const locationTypeLabels = {
  ROOM: 'Rom',
  SHELF: 'Reol',
  BOX: 'Boks',
  CONTAINER: 'Beholder',
  DRAWER: 'Skuff',
  CABINET: 'Skap',
  SHELF_COMPARTMENT: 'Hylle',
  BAG: 'Pose',
  SECTION: 'Avsnitt'
}

// Hierarki-regler for lokasjonstyper (samme som backend)
const HIERARCHY_RULES: Record<string, string[]> = {
  ROOM: ['SHELF', 'CABINET', 'CONTAINER'],
  SHELF: ['SHELF_COMPARTMENT', 'BOX', 'DRAWER'],
  SHELF_COMPARTMENT: ['BOX', 'BAG', 'CONTAINER'],
  BOX: ['BAG', 'SECTION'],
  BAG: [], // Kun gjenstander
  CABINET: ['DRAWER', 'SHELF_COMPARTMENT'],
  DRAWER: ['SECTION', 'BAG'],
  CONTAINER: ['BAG', 'SECTION'],
  SECTION: ['BAG']
}

// Helper function for validating parent-child relationship
function canBeChildOf(childType: string, parentType: string): boolean {
  return HIERARCHY_RULES[parentType]?.includes(childType) || false
}

// Helper function to flatten hierarchical location structure
function flattenLocations(locations: any[]): any[] {
  const flattened: any[] = []
  
  function addLocation(location: any) {
    flattened.push(location)
    if (location.children && location.children.length > 0) {
      location.children.forEach((child: any) => addLocation(child))
    }
  }
  
  locations.forEach(location => addLocation(location))
  return flattened
}

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<any>(null)
  const [showQRCode, setShowQRCode] = useState<string | null>(null)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'ROOM' as const,
    description: '',
    parentId: ''
  })

  // tRPC queries and mutations
  const { data: locations = [], isLoading, error, refetch } = trpc.locations.getAll.useQuery()
  
  // Flat list of all locations for dropdowns
  const allLocations = flattenLocations(locations)
  const createLocationMutation = trpc.locations.create.useMutation({
    onSuccess: () => {
      toast.success('Lokasjon opprettet!')
      setShowCreateForm(false)
      setNewLocation({ name: '', type: 'ROOM', description: '', parentId: '' })
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })
  const updateLocationMutation = trpc.locations.update.useMutation({
    onSuccess: () => {
      toast.success('Lokasjon oppdatert!')
      setEditingLocation(null)
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })
  const deleteLocationMutation = trpc.locations.delete.useMutation({
    onSuccess: () => {
      toast.success('Lokasjon slettet!')
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  // Filter locations based on search and type
  const filteredLocations = allLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || location.type === selectedType
    return matchesSearch && matchesType
  })

  const handleCreateLocation = () => {
    if (!newLocation.name.trim()) {
      toast.error('Navn er påkrevd')
      return
    }

    createLocationMutation.mutate({
      name: newLocation.name,
      type: newLocation.type,
      description: newLocation.description || undefined,
      parentId: newLocation.parentId === '' ? undefined : newLocation.parentId
    })
  }

  const handleUpdateLocation = () => {
    if (!editingLocation?.name.trim()) {
      toast.error('Navn er påkrevd')
      return
    }

    updateLocationMutation.mutate({
      id: editingLocation.id,
      name: editingLocation.name,
      type: editingLocation.type,
      description: editingLocation.description || undefined,
      parentId: editingLocation.parentId === '' ? undefined : editingLocation.parentId
    })
  }

  const handleDeleteLocation = (locationId: string) => {
    if (confirm('Er du sikker på at du vil slette denne lokasjonen?')) {
      deleteLocationMutation.mutate(locationId)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Laster lokasjoner...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Feil ved lasting av lokasjoner</h3>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Prøv igjen</Button>
        </div>
      </div>
    )
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
        <div className="flex gap-2">
          {/* Bulk actions when in selection mode */}
          {isSelectionMode && selectedLocations.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPrintDialog(true)}
              >
                <Printer className="w-4 h-4 mr-2" />
                Skriv ut ({selectedLocations.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLocations([])
                  setIsSelectionMode(false)
                }}
              >
                Avbryt valg
              </Button>
            </>
          )}
          
          {!isSelectionMode && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsSelectionMode(true)}
                disabled={allLocations.length === 0}
              >
                <Printer className="w-4 h-4 mr-2" />
                Bulk utskrift
              </Button>
              <AccessibleButton 
                onClick={() => setShowCreateForm(true)}
                aria-label="Opprett ny lokasjon"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ny lokasjon
              </AccessibleButton>
            </>
          )}
        </div>
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
            <SelectItem value="SHELF">Reol</SelectItem>
            <SelectItem value="SHELF_COMPARTMENT">Hylle</SelectItem>
            <SelectItem value="BOX">Boks</SelectItem>
            <SelectItem value="BAG">Pose</SelectItem>
            <SelectItem value="CONTAINER">Beholder</SelectItem>
            <SelectItem value="DRAWER">Skuff</SelectItem>
            <SelectItem value="CABINET">Skap</SelectItem>
            <SelectItem value="SECTION">Avsnitt</SelectItem>
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
                <Select value={newLocation.type} onValueChange={(value: any) => setNewLocation({...newLocation, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROOM">Rom</SelectItem>
                    <SelectItem value="SHELF">Reol</SelectItem>
                    <SelectItem value="SHELF_COMPARTMENT">Hylle</SelectItem>
                    <SelectItem value="BOX">Boks</SelectItem>
                    <SelectItem value="BAG">Pose</SelectItem>
                    <SelectItem value="CONTAINER">Beholder</SelectItem>
                    <SelectItem value="DRAWER">Skuff</SelectItem>
                    <SelectItem value="CABINET">Skap</SelectItem>
                    <SelectItem value="SECTION">Avsnitt</SelectItem>
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
            <div>
              <Label htmlFor="parent-location">Overordnet lokasjon (valgfritt)</Label>
              <Select value={newLocation.parentId} onValueChange={(value) => setNewLocation({...newLocation, parentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg overordnet lokasjon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen (rot-nivå)</SelectItem>
                  {allLocations
                    .filter(location => canBeChildOf(newLocation.type, location.type)) // Kun vis gyldige parents
                    .map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({locationTypeLabels[location.type as keyof typeof locationTypeLabels]})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <AccessibleButton 
                onClick={handleCreateLocation} 
                disabled={createLocationMutation.isPending}
                aria-label="Lagre ny lokasjon"
              >
                {createLocationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oppretter...
                  </>
                ) : (
                  'Opprett lokasjon'
                )}
              </AccessibleButton>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                disabled={createLocationMutation.isPending}
                aria-label="Avbryt opprettelse av lokasjon"
              >
                Avbryt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Location Form */}
      {editingLocation && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rediger lokasjon</CardTitle>
            <CardDescription>
              Oppdater informasjon om lokasjonen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location-name">Navn på lokasjon</Label>
                <Input
                  id="edit-location-name"
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({...editingLocation, name: e.target.value})}
                  placeholder="F.eks. Kjøkken, Soverom, Plastboks A"
                />
              </div>
              <div>
                <Label htmlFor="edit-location-type">Type</Label>
                <Select value={editingLocation.type} onValueChange={(value: any) => setEditingLocation({...editingLocation, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROOM">Rom</SelectItem>
                    <SelectItem value="SHELF">Reol</SelectItem>
                    <SelectItem value="SHELF_COMPARTMENT">Hylle</SelectItem>
                    <SelectItem value="BOX">Boks</SelectItem>
                    <SelectItem value="BAG">Pose</SelectItem>
                    <SelectItem value="CONTAINER">Beholder</SelectItem>
                    <SelectItem value="DRAWER">Skuff</SelectItem>
                    <SelectItem value="CABINET">Skap</SelectItem>
                    <SelectItem value="SECTION">Avsnitt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-location-description">Beskrivelse (valgfritt)</Label>
              <Input
                id="edit-location-description"
                value={editingLocation.description || ''}
                onChange={(e) => setEditingLocation({...editingLocation, description: e.target.value})}
                placeholder="Tilleggsinformasjon om lokasjonen"
              />
            </div>
            <div>
              <Label htmlFor="edit-parent-location">Overordnet lokasjon (valgfritt)</Label>
              <Select 
                value={editingLocation.parentId || 'none'} 
                onValueChange={(value) => setEditingLocation({...editingLocation, parentId: value === 'none' ? null : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg overordnet lokasjon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen (rot-nivå)</SelectItem>
                  {allLocations
                    .filter(location => 
                      location.id !== editingLocation.id && // Ikke vis seg selv
                      canBeChildOf(editingLocation.type, location.type) // Kun vis gyldige parents
                    )
                    .map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({locationTypeLabels[location.type as keyof typeof locationTypeLabels]})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <AccessibleButton 
                onClick={handleUpdateLocation} 
                disabled={updateLocationMutation.isPending}
                aria-label="Lagre endringer"
              >
                {updateLocationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Lagrer...
                  </>
                ) : (
                  'Lagre endringer'
                )}
              </AccessibleButton>
              <Button 
                variant="outline" 
                onClick={() => setEditingLocation(null)}
                disabled={updateLocationMutation.isPending}
                aria-label="Avbryt redigering"
              >
                Avbryt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Display Modal */}
      {showQRCode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>QR-kode</CardTitle>
            <CardDescription>
              Skann denne koden for å finne lokasjonen
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <QRCodeCard 
              value={showQRCode} 
              title={`Lokasjon: ${allLocations.find(loc => loc.qrCode === showQRCode)?.name || 'Ukjent'}`}
              description="Skann denne koden for å finne lokasjonen"
            />
            <Button 
              variant="outline" 
              onClick={() => setShowQRCode(null)}
              className="mt-4"
            >
              Lukk
            </Button>
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
                  {isSelectionMode && (
                    <Checkbox
                      checked={selectedLocations.includes(location.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLocations(prev => [...prev, location.id])
                        } else {
                          setSelectedLocations(prev => prev.filter(id => id !== location.id))
                        }
                      }}
                    />
                  )}
                  <LocationIcon type={location.type} />
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label={`Mer handlinger for ${location.name}`}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setShowQRCode(location.qrCode)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Vis QR-kode
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingLocation(location)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Rediger
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteLocation(location.id)}
                      className="text-red-600"
                      disabled={deleteLocationMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Slett
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">
                  {locationTypeLabels[location.type as keyof typeof locationTypeLabels]}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <QrCode className="w-3 h-3" />
                  {location.qrCode}
                </Badge>
                {location.parent && (
                  <Badge variant="outline" className="text-xs">
                    I: {location.parent.name}
                  </Badge>
                )}
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
                  {location._count?.items || 0} gjenstander
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => setShowQRCode(location.qrCode)}
                >
                  <QrCode className="w-3 h-3" />
                  QR-kode
                </Button>
              </div>

              {location.children && location.children.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Underlokasjoner ({location.children.length}):</h4>
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
                            {child._count?.items || 0} ting
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowQRCode(child.qrCode)}
                            className="h-6 w-6 p-0"
                          >
                            <QrCode className="w-3 h-3" />
                          </Button>
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

      {/* Dymo Print Dialog */}
      <DymoPrintDialog
        locations={selectedLocations.map(id => allLocations.find(loc => loc.id === id)!).filter(Boolean)}
        isOpen={showPrintDialog}
        onClose={() => {
          setShowPrintDialog(false)
          setSelectedLocations([])
          setIsSelectionMode(false)
        }}
      />
    </div>
  )
}
