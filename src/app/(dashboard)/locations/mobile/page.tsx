'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Search,
  Grid3X3,
  TreePine,
  Smartphone,
  Plus,
  Filter,
  SortAsc,
  MoreVertical,
  CheckSquare,
  Square,
  Loader2,
  RefreshCw
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { LocationModal } from '@/components/locations/LocationModal'
import { FloatingActionButton } from '@/components/locations/FloatingActionButton'
import { CompactLocationCard } from '@/components/locations/CompactLocationCard'

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

export default function LocationsMobilePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingLocation, setEditingLocation] = useState<any>(null)
  const [showQRCode, setShowQRCode] = useState<string | null>(null)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Pull-to-refresh state
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number>(0)
  const pullDistance = useRef<number>(0)
  const [isPulling, setIsPulling] = useState(false)

  // tRPC queries and mutations
  const { data: locations = [], isLoading, error, refetch } = trpc.locations.getAll.useQuery()
  
  // Flat list of all locations
  const allLocations = flattenLocations(locations)

  const createLocationMutation = trpc.locations.create.useMutation({
    onSuccess: () => {
      toast.success('Lokasjon opprettet!')
      setShowLocationModal(false)
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

  // Event handlers
  const handleCreateLocation = (template?: any) => {
    setModalMode('create')
    setEditingLocation(null)
    setShowLocationModal(true)
  }

  const handleEditLocation = (location: any) => {
    setModalMode('edit')
    setEditingLocation(location)
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
  }

  const handleDeleteLocation = (locationId: string) => {
    if (confirm('Er du sikker på at du vil slette denne lokasjonen?')) {
      deleteLocationMutation.mutate(locationId)
    }
  }

  const handleScanQR = () => {
    toast.info('QR-skanning kommer snart!')
  }

  const handleSearch = () => {
    const searchInput = document.querySelector('input[placeholder*="Søk"]') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }

  const handleLocationSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedLocations(prev => [...prev, id])
    } else {
      setSelectedLocations(prev => prev.filter(locId => locId !== id))
    }
  }

  const handleSelectAll = () => {
    setSelectedLocations(filteredLocations.map(loc => loc.id))
  }

  const handleDeselectAll = () => {
    setSelectedLocations([])
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedLocations([])
  }

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || containerRef.current?.scrollTop !== 0) return
    
    const currentY = e.touches[0].clientY
    pullDistance.current = currentY - startY.current
    
    if (pullDistance.current > 0) {
      e.preventDefault()
      // Add visual feedback here if needed
    }
  }

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance.current > 80) {
      setIsRefreshing(true)
      try {
        await refetch()
        toast.success('Oppdatert!')
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      } catch (error) {
        toast.error('Kunne ikke oppdatere')
      } finally {
        setIsRefreshing(false)
      }
    }
    setIsPulling(false)
    pullDistance.current = 0
  }

  // Filter and sort locations
  const filteredLocations = allLocations
    .filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || location.type === selectedType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'items':
          return (b._count?.items || 0) - (a._count?.items || 0)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href="/locations">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Mobile view
              </h1>
              <p className="text-xs text-muted-foreground">
                {allLocations.length} lokasjoner
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Selection mode toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectionMode}
              className={isSelectionMode ? 'bg-blue-100' : ''}
            >
              {isSelectionMode ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </Button>
            
            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/locations">
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Rutenettvisning
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/locations/tree">
                    <TreePine className="w-4 h-4 mr-2" />
                    Trevisning
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Oppdater
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Selection mode toolbar */}
        {isSelectionMode && (
          <div className="px-4 pb-3 border-t bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedLocations.length} valgt
                </span>
                {selectedLocations.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Fjern alle
                  </Button>
                )}
                {selectedLocations.length < filteredLocations.length && (
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Velg alle
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={toggleSelectionMode}>
                Ferdig
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Search and filters */}
      <div className="p-4 space-y-3 bg-white border-b">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Søk etter lokasjoner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="flex-1 h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle typer</SelectItem>
              <SelectItem value="ROOM">Rom</SelectItem>
              <SelectItem value="SHELF">Reol</SelectItem>
              <SelectItem value="BOX">Boks</SelectItem>
              <SelectItem value="CONTAINER">Beholder</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 h-9">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sorter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Navn</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="items">Antall ting</SelectItem>
              <SelectItem value="created">Opprettet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pull-to-refresh indicator */}
      {isRefreshing && (
        <div className="flex items-center justify-center py-4 bg-blue-50">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm">Oppdaterer...</span>
        </div>
      )}

      {/* Location list */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {filteredLocations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'Ingen lokasjoner funnet' : 'Ingen lokasjoner ennå'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery 
                ? 'Prøv å endre søket ditt' 
                : 'Begynn med å opprette ditt første rom'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => handleCreateLocation()}>
                <Plus className="w-4 h-4 mr-2" />
                Opprett første lokasjon
              </Button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3 pb-20">
            {filteredLocations.map((location) => (
              <CompactLocationCard
                key={location.id}
                location={location}
                onEdit={handleEditLocation}
                onDelete={handleDeleteLocation}
                onShowQR={setShowQRCode}
                onSelect={handleLocationSelect}
                isSelected={selectedLocations.includes(location.id)}
                isSelectionMode={isSelectionMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">QR-kode</h3>
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                {showQRCode}
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => setShowQRCode(null)}
                className="w-full"
              >
                Lukk
              </Button>
            </div>
          </div>
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
      <FloatingActionButton
        onCreateLocation={handleCreateLocation}
        onScanQR={handleScanQR}
        onSearch={handleSearch}
      />
    </div>
  )
}
