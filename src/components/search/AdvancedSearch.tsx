'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Filter,
  X,
  Calendar,
  Package,
  MapPin,
  Tag,
  DollarSign,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { trpc } from '@/lib/trpc/client'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { nb } from 'date-fns/locale'

export interface SearchFilters {
  query?: string
  categoryIds?: string[]
  locationIds?: string[]
  tags?: string[]
  priceRange?: {
    min?: number
    max?: number
  }
  quantityRange?: {
    min?: number
    max?: number
  }
  dateRange?: {
    field: 'createdAt' | 'purchaseDate' | 'expiryDate' | 'updatedAt'
    from?: Date
    to?: Date
  }
  status?: ('available' | 'lowStock' | 'outOfStock' | 'expired' | 'loanedOut')[]
  hasImages?: boolean
  hasBarcode?: boolean
  sortBy?: 'name' | 'createdAt' | 'price' | 'quantity' | 'expiryDate'
  sortOrder?: 'asc' | 'desc'
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
  showCompact?: boolean
  className?: string
}

export function AdvancedSearch({ 
  onFiltersChange, 
  initialFilters = {},
  showCompact = false,
  className = '' 
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(!showCompact)

  // Hent data for filter options
  const { data: categoriesData } = trpc.categories.getAll.useQuery()
  const categories = categoriesData || []
  const { data: locationsData } = trpc.locations.getAll.useQuery()
  const locations = locationsData || []
  // const { data: tagsData } = trpc.tags.getAll.useQuery()
  const tags: any[] = [] // Mock for now

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const clearFilters = () => {
    const cleared: SearchFilters = {
      query: '',
      sortBy: 'name',
      sortOrder: 'asc'
    }
    setFilters(cleared)
    onFiltersChange(cleared)
  }

  const presetDateRanges = [
    { label: 'Siste 7 dager', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: 'Siste 30 dager', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: 'Denne måneden', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: 'Siste 3 måneder', getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  ]

  const statusOptions = [
    { value: 'available', label: 'Tilgjengelig', color: 'bg-green-100 text-green-800' },
    { value: 'lowStock', label: 'Lavt lager', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'outOfStock', label: 'Tomt', color: 'bg-red-100 text-red-800' },
    { value: 'expired', label: 'Utløpt', color: 'bg-red-100 text-red-800' },
    { value: 'loanedOut', label: 'Utlånt', color: 'bg-blue-100 text-blue-800' },
  ] as const

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.query && filters.query.trim()) count++
    if (filters.categoryIds?.length) count++
    if (filters.locationIds?.length) count++
    if (filters.tags?.length) count++
    if (filters.priceRange?.min || filters.priceRange?.max) count++
    if (filters.quantityRange?.min || filters.quantityRange?.max) count++
    if (filters.dateRange?.from || filters.dateRange?.to) count++
    if (filters.status?.length) count++
    if (filters.hasImages !== undefined) count++
    if (filters.hasBarcode !== undefined) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  if (showCompact && !isExpanded) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="font-medium">Søk og filtrer</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} aktive filter
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Vis filtre
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Input
              placeholder="Søk i inventar..."
              value={filters.query || ''}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="flex-1"
            />
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Avansert søk og filtrering
            </CardTitle>
            <CardDescription>
              Bruk filtre for å finne nøyaktig det du leter etter
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} aktive filter
              </Badge>
            )}
            {showCompact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="space-y-2">
          <Label htmlFor="search-query">Søkeord</Label>
          <div className="flex gap-2">
            <Input
              id="search-query"
              placeholder="Søk etter navn, beskrivelse, merke..."
              value={filters.query || ''}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Nullstill
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Kategorier
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {categories.map((category: any) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categoryIds?.includes(category.id) || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters({
                        categoryIds: [...(filters.categoryIds || []), category.id]
                      })
                    } else {
                      updateFilters({
                        categoryIds: filters.categoryIds?.filter(id => id !== category.id)
                      })
                    }
                  }}
                />
                <Label 
                  htmlFor={`category-${category.id}`}
                  className="text-sm flex items-center gap-1 cursor-pointer"
                >
                  {category.icon && <span>{category.icon}</span>}
                  <span>{category.name}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Lokasjoner
          </Label>
          <Select
            value={filters.locationIds?.[0] || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                updateFilters({ locationIds: [] })
              } else {
                updateFilters({ locationIds: [value] })
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg lokasjon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle lokasjoner</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.parent ? `${location.parent.name} > ` : ''}{location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filters */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Status
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {statusOptions.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={filters.status?.includes(status.value) || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters({
                        status: [...(filters.status || []), status.value]
                      })
                    } else {
                      updateFilters({
                        status: filters.status?.filter(s => s !== status.value)
                      })
                    }
                  }}
                />
                <Label 
                  htmlFor={`status-${status.value}`}
                  className="text-sm cursor-pointer"
                >
                  <Badge variant="outline" className={`text-xs ${status.color}`}>
                    {status.label}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Prisområde
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="price-min" className="text-xs">Fra (kr)</Label>
              <Input
                id="price-min"
                type="number"
                placeholder="0"
                value={filters.priceRange?.min || ''}
                onChange={(e) => updateFilters({
                  priceRange: {
                    ...filters.priceRange,
                    min: e.target.value ? Number(e.target.value) : undefined
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="price-max" className="text-xs">Til (kr)</Label>
              <Input
                id="price-max"
                type="number"
                placeholder="∞"
                value={filters.priceRange?.max || ''}
                onChange={(e) => updateFilters({
                  priceRange: {
                    ...filters.priceRange,
                    max: e.target.value ? Number(e.target.value) : undefined
                  }
                })}
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Datofilter
          </Label>
          <div className="space-y-3">
            <div>
              <Label htmlFor="date-field" className="text-xs">Datotype</Label>
              <Select
                value={filters.dateRange?.field || 'createdAt'}
                onValueChange={(value: any) => updateFilters({
                  dateRange: {
                    ...filters.dateRange,
                    field: value
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Opprettet dato</SelectItem>
                  <SelectItem value="purchaseDate">Kjøpsdato</SelectItem>
                  <SelectItem value="expiryDate">Utløpsdato</SelectItem>
                  <SelectItem value="updatedAt">Sist oppdatert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Forhåndsdefinerte perioder</Label>
              <div className="grid grid-cols-2 gap-1">
                {presetDateRanges.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const range = preset.getValue()
                      updateFilters({
                        dateRange: {
                          ...filters.dateRange,
                          field: filters.dateRange?.field || 'createdAt',
                          from: range.from,
                          to: range.to
                        }
                      })
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Special Filters */}
        <div className="space-y-2">
          <Label>Spesialfiltre</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-images"
                checked={filters.hasImages || false}
                onCheckedChange={(checked) => updateFilters({ 
                  hasImages: checked ? true : undefined 
                })}
              />
              <Label htmlFor="has-images" className="text-sm cursor-pointer">
                Har bilder
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-barcode"
                checked={filters.hasBarcode || false}
                onCheckedChange={(checked) => updateFilters({ 
                  hasBarcode: checked ? true : undefined 
                })}
              />
              <Label htmlFor="has-barcode" className="text-sm cursor-pointer">
                Har strekkode
              </Label>
            </div>
          </div>
        </div>

        {/* Sorting */}
        <div className="space-y-2">
          <Label>Sortering</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={filters.sortBy || 'name'}
              onValueChange={(value: any) => updateFilters({ sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Navn</SelectItem>
                <SelectItem value="createdAt">Opprettet dato</SelectItem>
                <SelectItem value="price">Pris</SelectItem>
                <SelectItem value="quantity">Antall</SelectItem>
                <SelectItem value="expiryDate">Utløpsdato</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortOrder || 'asc'}
              onValueChange={(value: any) => updateFilters({ sortOrder: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Stigende</SelectItem>
                <SelectItem value="desc">Synkende</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applied Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm font-medium">Aktive filtre:</Label>
            <div className="flex flex-wrap gap-1">
              {filters.query && (
                <Badge variant="secondary" className="text-xs">
                  Søk: "{filters.query}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => updateFilters({ query: '' })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
              {filters.categoryIds?.map(id => {
                const category = categories.find((c: any) => c.id === id)
                return category ? (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {category.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => updateFilters({
                        categoryIds: filters.categoryIds?.filter(cId => cId !== id)
                      })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ) : null
              })}
              {filters.status?.map(status => {
                const statusOption = statusOptions.find(s => s.value === status)
                return statusOption ? (
                  <Badge key={status} variant="secondary" className="text-xs">
                    {statusOption.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => updateFilters({
                        status: filters.status?.filter(s => s !== status)
                      })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ) : null
              })}
              {(filters.priceRange?.min || filters.priceRange?.max) && (
                <Badge variant="secondary" className="text-xs">
                  Pris: {filters.priceRange?.min || 0} - {filters.priceRange?.max || '∞'} kr
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => updateFilters({ priceRange: undefined })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enkelt søkefelt for rask bruk
export function QuickSearch({ 
  onSearch,
  placeholder = "Søk...",
  className = ""
}: {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button type="submit" variant="outline">
        <Search className="w-4 h-4" />
      </Button>
    </form>
  )
}
