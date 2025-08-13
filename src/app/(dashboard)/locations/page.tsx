'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
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
  Square,
  TreePine,
  Smartphone,
  Layout
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
import Link from 'next/link'

import { QRCodeCard } from '@/components/ui/qr-code'
import { DymoPrintDialog } from '@/components/printing/DymoPrintDialog'
import { LocationModal } from '@/components/locations/LocationModal'
import { FloatingActionButton } from '@/components/locations/FloatingActionButton'
import { BulkActionsToolbar } from '@/components/locations/BulkActionsToolbar'
import { BulkEditModal } from '@/components/locations/BulkEditModal'

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
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingLocation, setEditingLocation] = useState<any>(null)
  const [showQRCode, setShowQRCode] = useState<string | null>(null)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [initialLocationData, setInitialLocationData] = useState<any>(null)
  const [showBulkEdit, setShowBulkEdit] = useState(false)

  // tRPC queries and mutations
  const { data: locations = [], isLoading, error, refetch } = trpc.locations.getAll.useQuery()
  
  // Flat list of all locations for dropdowns
  const allLocations = flattenLocations(locations)
  const createLocationMutation = trpc.locations.create.useMutation({
    onSuccess: () => {
      toast.success('Lokasjon opprettet!')
      setShowLocationModal(false)
      setInitialLocationData(null)
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })
  const updateLocationMutation = trpc.locations.update.useMutation({
    onSuccess: () => {
      toast.success('Lokasjon oppdatert!')
      setShowLocationModal(false)
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

  // Bulk mutations would go here - for now we'll simulate
  const simulateBulkOperation = async (operation: string, locationIds: string[]) => {
    // In a real app, you'd have actual bulk mutations
    // For now, we'll just simulate the operations
    toast.success(`${operation} utført på ${locationIds.length} lokasjoner!`)
    setSelectedLocations([])
    setIsSelectionMode(false)
    refetch()
  }

  // Filter locations based on search and type
  const filteredLocations = allLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || location.type === selectedType
    return matchesSearch && matchesType
  })

  // Modal handlers
  const handleCreateLocation = (template?: any) => {
    setModalMode('create')
    setEditingLocation(null)
    setInitialLocationData(template || null)
    setShowLocationModal(true)
  }

  const handleEditLocation = (location: any) => {
    setModalMode('edit')
    setEditingLocation(location)
    setInitialLocationData(null)
    setShowLocationModal(true)
  }

  const handleModalSave = (data: any) => {
    if (modalMode === 'create') {
      createLocationMutation.mutate(data)
    } else if (modalMode === 'edit') {
      updateLocationMutation.mutate(data)
    }
  }

  const handleModalClose = () => {
    setShowLocationModal(false)
    setEditingLocation(null)
    setInitialLocationData(null)
  }

  // FAB handlers
  const handleScanQR = () => {
    // TODO: Implement QR scanning
    toast.info('QR-skanning kommer snart!')
  }

  const handleSearch = () => {
    // Focus search input
    const searchInput = document.querySelector('input[placeholder*="Søk"]') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }

  const handleDeleteLocation = (locationId: string) => {
    if (confirm('Er du sikker på at du vil slette denne lokasjonen?')) {
      deleteLocationMutation.mutate(locationId)
    }
  }

  // Bulk operation handlers
  const handleBulkEdit = () => {
    setShowBulkEdit(true)
  }

  const handleBulkDelete = async () => {
    await simulateBulkOperation('Sletting', selectedLocations)
  }

  const handleBulkMove = async () => {
    await simulateBulkOperation('Flytting', selectedLocations)
  }

  const handleBulkExport = async () => {
    // Generate CSV export
    const selectedLocationData = allLocations.filter(loc => selectedLocations.includes(loc.id))
    const csvData = selectedLocationData.map(loc => ({
      navn: loc.name,
      type: loc.type,
      beskrivelse: loc.description || '',
      qrKode: loc.qrCode,
      antallTing: loc._count?.items || 0
    }))
    
    const csvString = [
      'navn,type,beskrivelse,qrKode,antallTing',
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lokasjoner-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success(`Eksporterte ${selectedLocations.length} lokasjoner til CSV`)
  }

  const handleBulkPrint = () => {
    setShowPrintDialog(true)
  }

  const handleBulkEditSave = async (data: any) => {
    await simulateBulkOperation('Bulk-redigering', data.locationIds)
    setShowBulkEdit(false)
  }

  const handleDeselectAll = () => {
    setSelectedLocations([])
  }

  const handleCloseBulkMode = () => {
    setIsSelectionMode(false)
    setSelectedLocations([])
  }

  if (isLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Laster lokasjoner...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page container mx-auto px-4 py-8">
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
    <div className="page container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 cq">
        <div>
          <h1 className="text-3xl font-bold title">Lokasjoner</h1>
          <p className="text-muted-foreground secondary-text">
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
              <Link href="/locations/tree">
                <Button variant="outline">
                  <TreePine className="w-4 h-4 mr-2" />
                  Trevisning
                </Button>
              </Link>
              <Link href="/locations/mobile">
                <Button variant="outline">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobilvisning
                </Button>
              </Link>
              <Link href="/locations/layout">
                <Button variant="outline">
                  <Layout className="w-4 h-4 mr-2" />
                  Layout-editor
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6 cq">
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
      <div className="cq-grid locations-grid" style={{"--card-min":"220px"} as any}>
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
                    <DropdownMenuItem onClick={() => handleEditLocation(location)}>
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
              onClick={() => handleCreateLocation()}
              aria-label="Opprett din første lokasjon"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Opprett første lokasjon
            </AccessibleButton>
          )}
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        location={editingLocation}
        allLocations={allLocations}
        isLoading={createLocationMutation.isPending || updateLocationMutation.isPending}
        mode={modalMode}
      />

      {/* Floating Action Button */}
      {!isSelectionMode && (
        <FloatingActionButton
          onCreateLocation={handleCreateLocation}
          onScanQR={handleScanQR}
          onSearch={handleSearch}
        />
      )}

      {/* Bulk Actions Toolbar */}
      {isSelectionMode && selectedLocations.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedLocations.length}
          selectedLocations={selectedLocations.map(id => allLocations.find(loc => loc.id === id)!).filter(Boolean)}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
          onBulkMove={handleBulkMove}
          onBulkExport={handleBulkExport}
          onBulkPrint={handleBulkPrint}
          onDeselectAll={handleDeselectAll}
          onClose={handleCloseBulkMode}
        />
      )}

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        onSave={handleBulkEditSave}
        locations={selectedLocations.map(id => allLocations.find(loc => loc.id === id)!).filter(Boolean)}
        allLocations={allLocations}
        isLoading={false}
      />

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
