'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Home,
  Package,
  Archive,
  Folder,
  FileText,
  Layers,
  ShoppingBag,
  Square,
  Plus,
  Search,
  Grid3X3,
  TreePine,
  Edit2,
  Trash2,
  Eye,
  QrCode,
  Loader2,
  GripVertical,
  MapPin
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { LocationModal } from '@/components/locations/LocationModal'
import { FloatingActionButton } from '@/components/locations/FloatingActionButton'

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

interface TreeNodeProps {
  location: any
  level: number
  isExpanded: boolean
  onToggle: () => void
  onEdit: (location: any) => void
  onDelete: (id: string) => void
  onShowQR: (qrCode: string) => void
  allLocations: any[]
  expandedNodes: Set<string>
  setExpandedNodes: (nodes: Set<string>) => void
  searchQuery: string
}

function TreeNode({ 
  location, 
  level, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete, 
  onShowQR,
  allLocations,
  expandedNodes,
  setExpandedNodes,
  searchQuery 
}: TreeNodeProps) {
  const Icon = locationTypeIcons[location.type as keyof typeof locationTypeIcons] || MapPin
  const hasChildren = location.children && location.children.length > 0
  const indent = level * 24 // 24px per level
  
  // Check if this node or any children match search
  const matchesSearch = (loc: any): boolean => {
    if (loc.name.toLowerCase().includes(searchQuery.toLowerCase())) return true
    if (loc.children) {
      return loc.children.some((child: any) => matchesSearch(child))
    }
    return false
  }
  
  const shouldShow = !searchQuery || matchesSearch(location)
  
  if (!shouldShow) return null

  const handleToggle = () => {
    if (hasChildren) {
      const newExpanded = new Set(expandedNodes)
      if (isExpanded) {
        newExpanded.delete(location.id)
      } else {
        newExpanded.add(location.id)
      }
      setExpandedNodes(newExpanded)
    }
  }

  const isHighlighted = searchQuery && location.name.toLowerCase().includes(searchQuery.toLowerCase())

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-2 px-3 rounded-lg hover:bg-muted transition-colors group ${
          isHighlighted ? 'bg-yellow-50 border border-yellow-200' : ''
        }`}
        style={{ marginLeft: `${indent}px` }}
      >
        {/* Expand/Collapse toggle */}
        <div className="w-6 h-6 flex items-center justify-center">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 hover:bg-muted-foreground/10"
              onClick={handleToggle}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* Drag handle */}
        <div className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Location icon */}
        <Icon className="w-4 h-4 mr-2 text-muted-foreground" />

        {/* Location name and info */}
        <div className="flex-1 flex items-center gap-2">
          <span className="font-medium">{location.name}</span>
          
          <Badge variant="secondary" className="text-xs">
            {locationTypeLabels[location.type as keyof typeof locationTypeLabels]}
          </Badge>
          
          <Badge variant="outline" className="text-xs">
            {location._count?.items || 0} ting
          </Badge>
          
          {hasChildren && (
            <Badge variant="outline" className="text-xs">
              {location.children.length} under
            </Badge>
          )}
        </div>

        {/* QR Code */}
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onShowQR(location.qrCode)}
        >
          <QrCode className="w-3 h-3" />
        </Button>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onShowQR(location.qrCode)}>
              <Eye className="w-4 h-4 mr-2" />
              Vis QR-kode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(location)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Rediger
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(location.id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Slett
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-3">
          {location.children.map((child: any) => {
            const childExpanded = expandedNodes.has(child.id)
            return (
              <TreeNode
                key={child.id}
                location={child}
                level={level + 1}
                isExpanded={childExpanded}
                onToggle={() => {}}
                onEdit={onEdit}
                onDelete={onDelete}
                onShowQR={onShowQR}
                allLocations={allLocations}
                expandedNodes={expandedNodes}
                setExpandedNodes={setExpandedNodes}
                searchQuery={searchQuery}
              />
            )
          })}
        </div>
      )}
    </div>
  )
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

export default function LocationsTreePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingLocation, setEditingLocation] = useState<any>(null)
  const [showQRCode, setShowQRCode] = useState<string | null>(null)

  // tRPC queries and mutations
  const { data: locations = [], isLoading, error, refetch } = trpc.locations.getAll.useQuery()
  
  // Flat list of all locations for dropdowns
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

  const handleExpandAll = () => {
    const allIds = new Set<string>()
    allLocations.forEach(loc => allIds.add(loc.id))
    setExpandedNodes(allIds)
  }

  const handleCollapseAll = () => {
    setExpandedNodes(new Set())
  }

  // Filter locations based on search and type
  const filteredLocations = locations.filter(location => {
    if (selectedType !== 'all') {
      // For tree view, we need to check if location or any descendant matches type
      const hasMatchingType = (loc: any): boolean => {
        if (loc.type === selectedType) return true
        if (loc.children) {
          return loc.children.some((child: any) => hasMatchingType(child))
        }
        return false
      }
      return hasMatchingType(location)
    }
    return true
  })

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

  return (
    <div className="page container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 cq">
        <div className="flex items-center gap-4">
          <Link href="/locations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake til rutenett
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TreePine className="w-8 h-8" />
              Lokasjoner - Trevisning
            </h1>
            <p className="text-muted-foreground">
              Hierarkisk visning av alle lokasjoner med drag & drop
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExpandAll}
            disabled={allLocations.length === 0}
          >
            Utvid alle
          </Button>
          <Button
            variant="outline"
            onClick={handleCollapseAll}
            disabled={allLocations.length === 0}
          >
            Skjul alle
          </Button>
          <Link href="/locations">
            <Button variant="outline">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Rutenettvisning
            </Button>
          </Link>
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

      {/* Tree View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            Hierarkisk struktur
          </CardTitle>
          <CardDescription>
            Bruk pilene for å utvide/skjule underlokasjoner. Dra for å reorganisere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <TreePine className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'Ingen lokasjoner funnet' : 'Ingen lokasjoner ennå'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Prøv å endre søket ditt eller filteret' 
                  : 'Begynn med å opprette ditt første rom eller oppbevaringssted'
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
            <div className="space-y-1">
              {filteredLocations.map((location) => {
                const isExpanded = expandedNodes.has(location.id)
                return (
                  <TreeNode
                    key={location.id}
                    location={location}
                    level={0}
                    isExpanded={isExpanded}
                    onToggle={() => {}}
                    onEdit={handleEditLocation}
                    onDelete={handleDeleteLocation}
                    onShowQR={setShowQRCode}
                    allLocations={allLocations}
                    expandedNodes={expandedNodes}
                    setExpandedNodes={setExpandedNodes}
                    searchQuery={searchQuery}
                  />
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Display */}
      {showQRCode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>QR-kode</CardTitle>
            <CardDescription>
              Skann denne koden for å finne lokasjonen
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                {showQRCode}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowQRCode(null)}
            >
              Lukk
            </Button>
          </CardContent>
        </Card>
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
