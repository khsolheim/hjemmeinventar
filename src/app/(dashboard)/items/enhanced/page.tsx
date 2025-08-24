'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, 
  Package, 
  Search, 
  Filter,
  MoreVertical,
  MapPin,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Grid,
  List,
  Download,
  Share2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdvancedSearch, type SearchFilters } from '@/components/search/AdvancedSearch'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import Link from 'next/link'

export default function EnhancedItemsPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'name',
    sortOrder: 'asc'
  })
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)

  // Enhanced query with all filter options
  const queryOptions = useMemo(() => {
    const options: any = {
      limit: 100,
      search: filters.query,
      categoryId: filters.categoryIds?.[0],
      locationId: filters.locationIds?.[0],
    }

    // Add price range filtering
    if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) {
      options.priceRange = filters.priceRange
    }

    // Add sorting
    if (filters.sortBy && filters.sortOrder) {
      options.sortBy = filters.sortBy
      options.sortOrder = filters.sortOrder
    }

    return options
  }, [filters])

  const { data: itemsData, isLoading, error, refetch } = trpc.items.getAll.useQuery(queryOptions)
  
  // Extract items from the response object  
  const items = itemsData?.items || []
  const { data: locations = [] } = trpc.locations.getAll.useQuery()
  const { data: categories = [] } = trpc.categories.getAll.useQuery()

  // Bulk delete mutation
  const bulkDeleteMutation = trpc.items.bulkDelete.useMutation({
    onSuccess: (result) => {
      toast.success(`Slettet ${result.deletedCount} gjenstander`)
      setSelectedItems([])
      setIsSelectionMode(false)
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil ved sletting: ${error.message}`)
    }
  })

  // Filter items on frontend for advanced filters that aren't handled by backend
  const filteredItems = useMemo(() => {
    let filtered = [...items]

    // Status filtering
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((item: any) => {
        const hasStatus = (status: string) => {
          switch (status) {
            case 'available':
              return Number(item.availableQuantity) > 1
            case 'lowStock':
              return Number(item.availableQuantity) <= 1 && Number(item.availableQuantity) > 0
            case 'outOfStock':
              return Number(item.availableQuantity) === 0
            case 'expired':
              return item.expiryDate && new Date(item.expiryDate) < new Date()
            case 'loanedOut':
              return item.loan?.status === 'OUT'
            default:
              return false
          }
        }
        return filters.status!.some(status => hasStatus(status))
      })
    }

    // Quantity range filtering
    if (filters.quantityRange?.min !== undefined || filters.quantityRange?.max !== undefined) {
      filtered = filtered.filter((item: any) => {
        const qty = Number(item.availableQuantity)
        if (filters.quantityRange?.min !== undefined && qty < filters.quantityRange.min) return false
        if (filters.quantityRange?.max !== undefined && qty > filters.quantityRange.max) return false
        return true
      })
    }

    // Date range filtering
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter((item: any) => {
        const field = filters.dateRange!.field || 'createdAt'
        const itemDate = new Date(item[field as keyof typeof item] as string)
        
        if (filters.dateRange?.from && itemDate < filters.dateRange.from) return false
        if (filters.dateRange?.to && itemDate > filters.dateRange.to) return false
        return true
      })
    }

    // Special filters
    if (filters.hasImages) {
      filtered = filtered.filter((item: any) => 
        item.attachments && item.attachments.some((att: any) => att.type === 'IMAGE')
      )
    }

    if (filters.hasBarcode) {
      filtered = filtered.filter((item: any) => item.barcode)
    }

    return filtered
  }, [items, filters])

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return
    
    if (confirm(`Er du sikker på at du vil slette ${selectedItems.length} gjenstander?`)) {
      bulkDeleteMutation.mutate(selectedItems)
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map((item: any) => item.id))
    }
  }

  const handleExport = () => {
    // Create CSV export
    const csvData = filteredItems.map((item: any) => ({
      Navn: item.name,
      Kategori: item.category?.name || '',
      Lokasjon: item.location.name,
      Antall: Number(item.availableQuantity),
      Enhet: item.unit,
      Pris: item.price || '',
      Opprettet: new Date(item.createdAt).toLocaleDateString('no-NO'),
      Beskrivelse: item.description || ''
    }))

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `inventar_${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    toast.success('Inventar eksportert til CSV')
  }

  const getStatusBadge = (item: any) => {
    if (item.availableQuantity === 0) {
      return <Badge variant="destructive">Tomt</Badge>
    }
    if (item.availableQuantity <= 1) {
      return <Badge variant="secondary">Lavt lager</Badge>
    }
    if (item.loan?.status === 'OUT') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Utlånt</Badge>
    }
    if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
      return <Badge variant="destructive">Utløpt</Badge>
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700">Tilgjengelig</Badge>
  }

  if (isLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Laster gjenstander...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Feil ved lasting av gjenstander</h3>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Prøv igjen</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 cq">
        <div>
          <h1 className="text-3xl font-bold title">Forbedret gjenstander</h1>
          <p className="text-muted-foreground secondary-text">
            {filteredItems.length} av {items.length} gjenstander{filters.query ? ` for "${filters.query}"` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {isSelectionMode && selectedItems.length > 0 && (
            <>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Slett ({selectedItems.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedItems([])
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
                disabled={filteredItems.length === 0}
              >
                Velg flere
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={filteredItems.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Eksporter
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showAdvancedSearch ? 'Skjul' : 'Vis'} filtre
              </Button>
            </>
          )}
          
          <AccessibleButton asChild>
            <Link href="/items/new">
              <Plus className="w-4 h-4 mr-2" />
              Ny gjenstand
            </Link>
          </AccessibleButton>
        </div>
      </div>

      {/* Advanced Search */}
      {showAdvancedSearch && (
        <AdvancedSearch
          onFiltersChange={setFilters}
          initialFilters={filters}
          className="mb-6"
        />
      )}

      {/* View Controls */}
      <div className="flex justify-between items-center mb-6 cq">
        <div className="flex items-center gap-4">
          {isSelectionMode && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">
                {selectedItems.length === filteredItems.length && filteredItems.length > 0
                  ? 'Fjern alle'
                  : 'Velg alle'
                }
              </span>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            {selectedItems.length > 0 && `${selectedItems.length} valgt • `}
            {filteredItems.length} gjenstander funnet
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Items Display */}
      {viewMode === 'grid' ? (
        <div className="cq-grid items-grid gap-6" style={{"--card-min":"220px"} as any}>
          {filteredItems.map((item: any) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow group cursor-pointer">
              <Link href={`/items/${item.id}`} className="block">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      {isSelectionMode && (
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItems(prev => [...prev, item.id])
                            } else {
                              setSelectedItems(prev => prev.filter(id => id !== item.id))
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {item.category?.icon || '📦'}
                          </span>
                          <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.name}</CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                    {!isSelectionMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Rediger
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Slett
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.category && <Badge variant="secondary">{item.category.name}</Badge>}
                    {getStatusBadge(item)}
                  </div>
                </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Quantity and Progress */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {item.availableQuantity} av {item.totalQuantity} {item.unit}
                  </span>
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((Number(item.availableQuantity) / item.totalQuantity) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">
                    {item.location.parent 
                      ? `${item.location.parent.name} > ${item.location.name}`
                      : item.location.name
                    }
                  </span>
                </div>

                {/* Price and Date */}
                <div className="flex items-center justify-between text-sm">
                  {item.price && (
                    <div className="flex items-center gap-1 font-medium">
                      <DollarSign className="w-4 h-4" />
                      <span>{Number(item.price)} kr</span>
                    </div>
                  )}
                  {item.expiryDate && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">
                        {new Date(item.expiryDate).toLocaleDateString('no-NO')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredItems.map((item: any, index: number) => (
                <Link href={`/items/${item.id}`} key={item.id}>
                  <div 
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${index !== filteredItems.length - 1 ? 'border-b' : ''}`}
                  >
                    {isSelectionMode && (
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems(prev => [...prev, item.id])
                          } else {
                            setSelectedItems(prev => prev.filter(id => id !== item.id))
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                    <span className="text-lg">{item.category?.icon || '📦'}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium line-clamp-1">{item.name}</h3>
                      {getStatusBadge(item)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.description || 'Ingen beskrivelse'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {item.availableQuantity} {item.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.location.name}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {item.price && (
                      <div className="text-sm font-medium">
                        {Number(item.price)} kr
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('no-NO')}
                    </div>
                  </div>
                  
                    {!isSelectionMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Rediger
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Slett
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">
            {items.length === 0 ? 'Ingen gjenstander ennå' : 'Ingen gjenstander funnet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {items.length === 0 
              ? 'Begynn med å legge til din første gjenstand i inventaret'
              : 'Prøv å endre søket eller filtrene dine'
            }
          </p>
          {items.length === 0 && (
            <AccessibleButton asChild>
              <Link href="/items/new">
                <Plus className="w-4 h-4 mr-2" />
                Legg til første gjenstand
              </Link>
            </AccessibleButton>
          )}
        </div>
      )}
    </div>
  )
}
