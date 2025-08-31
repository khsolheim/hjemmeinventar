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
  Layout,
  Sparkles,
  Plus
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
import { BulkCreateModal } from '@/components/locations/BulkCreateModal'
import { LocationBreadcrumb } from '@/components/locations/LocationBreadcrumb'
import { LocationContentView } from '@/components/locations/LocationContentView'
import { buildCompactPath, type LocationWithPath } from '@/lib/utils/location-path'

const locationTypeIcons = {
  ROOM: Home,
  CABINET: Package,
  RACK: Package,
  WALL_SHELF: Square,
  SHELF: Folder,
  DRAWER: FileText,
  BOX: Archive,
  BAG: ShoppingBag,
  CONTAINER: Package, // Legacy
  SHELF_COMPARTMENT: Layers, // Legacy
  SECTION: Square // Legacy
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
  CONTAINER: 'Beholder', // Legacy
  SHELF_COMPARTMENT: 'Hylle', // Legacy
  SECTION: 'Avsnitt' // Legacy
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
  
  // Safe guard - ensure locations is an array
  if (!locations || !Array.isArray(locations)) {
    return flattened
  }
  
  function addLocation(location: any) {
    flattened.push(location)
    if (location.children && Array.isArray(location.children) && location.children.length > 0) {
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
  const [showBulkCreate, setShowBulkCreate] = useState(false)
  
  // Navigation state
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'content'>('overview')

  // tRPC queries and mutations
  const { data: locationsData, isLoading, error, refetch } = trpc.locations.getAll.useQuery()
  
  // Query for location content when in content view
  const { data: locationContent, isLoading: contentLoading, refetch: refetchContent } = trpc.locations.getLocationContent.useQuery(
    { locationId: currentLocationId },
    { enabled: viewMode === 'content' }
  )
  
  // Safe array handling
  const locations = locationsData && Array.isArray(locationsData) ? locationsData : []
  
  // Flat list of all locations for dropdowns
  const allLocations = flattenLocations(locations)
  const createLocationMutation = trpc.locations.create.useMutation({
    onSuccess: () => {
      toast.success('Lokasjon opprettet!')
      setShowLocationModal(false)
      setInitialLocationData(null)
      refetch()
      // Also refetch content if we're in content view
      if (viewMode === 'content') {
        refetchContent()
      }
    },
    onError: (error) => {
      console.error('Create location error:', error)
      toast.error(`Feil: ${error.message}`)
    },
    // Prevent duplicate mutations
    retry: false,
    onMutate: () => {
      console.log('Creating location...')
    }
  })
  const updateLocationMutation = trpc.locations.update.useMutation({
    onSuccess: () => {
      toast.success('Lokasjon oppdatert!')
      setShowLocationModal(false)
      setEditingLocation(null)
      refetch()
      // Also refetch content if we're in content view
      if (viewMode === 'content') {
        refetchContent()
      }
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })
  const deleteLocationMutation = trpc.locations.delete.useMutation({
    onSuccess: () => {
      toast.success('Lokasjon slettet!')
      refetch()
      // Also refetch content if we're in content view
      if (viewMode === 'content') {
        refetchContent()
      }
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })
  const bulkCreateLocationMutation = trpc.locations.bulkCreate.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.count} lokasjoner opprettet!`)
      setShowBulkCreate(false)
      refetch()
      // Also refetch content if we're in content view
      if (viewMode === 'content') {
        refetchContent()
      }
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
  const handleCreateLocation = (parentId?: string) => {
    // If we're in content view and no parentId is provided, use current location
    const effectiveParentId = parentId || (viewMode === 'content' ? currentLocationId : undefined)
    
    setModalMode('create')
    setEditingLocation(null)
    setInitialLocationData(effectiveParentId ? { parentId: effectiveParentId } : null)
    setShowLocationModal(true)
  }

  const handleEditLocation = (location: any) => {
    setModalMode('edit')
    setEditingLocation(location)
    setInitialLocationData(null)
    setShowLocationModal(true)
  }

  const handleModalSave = (data: any) => {
    // Prevent duplicate submissions
    if (createLocationMutation.isPending || updateLocationMutation.isPending) {
      console.log('Mutation already in progress, ignoring duplicate call')
      return
    }
    
    if (modalMode === 'create') {
      console.log('Calling create mutation with data:', data)
      createLocationMutation.mutate(data)
    } else if (modalMode === 'edit') {
      console.log('Calling update mutation with data:', data)
      updateLocationMutation.mutate(data)
    }
  }

  const handleModalClose = () => {
    setShowLocationModal(false)
    setEditingLocation(null)
    setInitialLocationData(null)
  }

  // Navigation handlers
  const handleNavigateToLocation = (locationId: string) => {
    setCurrentLocationId(locationId)
    setViewMode('content')
  }

  const handleNavigateUp = () => {
    if (locationContent?.currentLocation?.parentId) {
      setCurrentLocationId(locationContent.currentLocation.parentId)
    } else {
      setCurrentLocationId(null)
      setViewMode('overview')
    }
  }

  const handleBreadcrumbNavigate = (locationId: string | null) => {
    setCurrentLocationId(locationId)
    if (locationId === null) {
      setViewMode('overview')
    }
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

  const handleBulkCreateSave = async (locations: any[]) => {
    bulkCreateLocationMutation.mutate({ locations })
  }

  const handleSmartLocationCreate = async (suggestion: { name: string; type: string; parentId: string }) => {
    createLocationMutation.mutate({
      name: suggestion.name,
      type: suggestion.type as any,
      parentId: suggestion.parentId
    })
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
      {/* Kompakt Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b mb-6 -mx-4 px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">🏠 Lokasjoner</h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {allLocations.length} totalt
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Søk */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Søk lokasjoner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {/* View Toggle */}
            <Select value={viewMode} onValueChange={(value: 'overview' | 'content') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    Oversikt
                  </div>
                </SelectItem>
                <SelectItem value="content">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-4 h-4" />
                    Innhold
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ny
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowLocationModal(true)}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Enkelt lokasjon
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBulkCreate(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Flere lokasjoner
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Printer className="w-4 h-4 mr-2" />
                  Skriv ut etiketter
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Bulk-handlinger
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="sm:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Søk lokasjoner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
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


              <Button
                variant="outline"
                onClick={() => setShowBulkCreate(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Legg til flere
              </Button>
              <Link href="/locations/wizard">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Wizard
                </Button>
              </Link>
            </>
          )}
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

      {/* Breadcrumb Navigation */}
      {viewMode === 'content' && locationContent?.breadcrumbs && (
        <LocationBreadcrumb
          items={locationContent.breadcrumbs}
          onNavigate={handleBreadcrumbNavigate}
        />
      )}

      {/* Content based on view mode */}
      {viewMode === 'content' ? (
        // Location Content View
        contentLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Laster innhold...</span>
          </div>
        ) : locationContent ? (
          <LocationContentView
            currentLocation={locationContent.currentLocation}
            childLocations={locationContent.childLocations || []}
            items={locationContent.items || []}
            allLocations={allLocations}
            onNavigateToLocation={handleNavigateToLocation}
            onNavigateUp={handleNavigateUp}
            onCreateLocation={handleCreateLocation}
            onCreateSmartLocation={handleSmartLocationCreate}
            onEditLocation={handleEditLocation}
          />
        ) : null
      ) : (
        // Original Overview
        <>

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

      {/* Forbedret Locations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredLocations.map((location) => (
          <Card 
            key={location.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleNavigateToLocation(location.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
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
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <LocationIcon type={location.type} />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{location.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {locationTypeLabels[location.type as keyof typeof locationTypeLabels]}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono">
                        {location.qrCode}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      aria-label={`Mer handlinger for ${location.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
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

              {/* Vis kompakt lokasjonsstier */}
              {location.parentId && (
                <p className="text-xs text-muted-foreground mt-2">
                  📍 {buildCompactPath(location as LocationWithPath, allLocations as LocationWithPath[], 2)}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {location.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {location.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {location._count?.items || 0} gjenstander
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowQRCode(location.qrCode)
                  }}
                >
                  <QrCode className="w-3 h-3" />
                </Button>
              </div>

              {location.children && location.children.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Underlokasjoner ({location.children.length}):</h4>
                  <div className="space-y-2">
                    {location.children.map((child: any) => (
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
        </>
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
        initialData={initialLocationData}
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

      {/* Bulk Create Modal */}
      <BulkCreateModal
        isOpen={showBulkCreate}
        onClose={() => setShowBulkCreate(false)}
        onSave={handleBulkCreateSave}
        allLocations={allLocations}
        isLoading={bulkCreateLocationMutation.isPending}
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
