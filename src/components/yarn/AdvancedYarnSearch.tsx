'use client'

import { useState } from 'react'
import { Search, Filter, X, Calendar, DollarSign, Package, Palette, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DatePicker } from '@/components/ui/date-picker'

interface AdvancedSearchFilters {
  // Text search
  searchQuery: string
  
  // Master filters
  producer: string
  composition: string
  yarnWeight: string
  needleSize: string
  store: string
  
  // Batch filters
  color: string
  condition: string
  batchNumber: string
  
  // Quantity and price filters
  quantityRange: [number, number]
  priceRange: [number, number]
  availabilityStatus: string
  
  // Date filters
  purchaseDateFrom: Date | undefined
  purchaseDateTo: Date | undefined
  
  // Special filters
  hasProjects: boolean
  hasNotes: boolean
  lowStock: boolean
  recentlyAdded: boolean
}

interface AdvancedYarnSearchProps {
  onSearch: (filters: AdvancedSearchFilters) => void
  onClear: () => void
  isLoading?: boolean
  compact?: boolean
}

export function AdvancedYarnSearch({ onSearch, onClear, isLoading, compact = false }: AdvancedYarnSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    searchQuery: '',
    producer: 'all',
    composition: 'all',
    yarnWeight: '',
    needleSize: 'all',
    store: '',
    color: '',
    condition: 'all',
    batchNumber: '',
    quantityRange: [0, 100],
    priceRange: [0, 500],
    availabilityStatus: 'all',
    purchaseDateFrom: undefined,
    purchaseDateTo: undefined,
    hasProjects: false,
    hasNotes: false,
    lowStock: false,
    recentlyAdded: false,
  })

  const updateFilter = <K extends keyof AdvancedSearchFilters>(
    key: K,
    value: AdvancedSearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters({
      searchQuery: '',
      producer: 'all',
      composition: 'all',
      yarnWeight: '',
      needleSize: 'all',
      store: '',
      color: '',
      condition: 'all',
      batchNumber: '',
      quantityRange: [0, 100],
      priceRange: [0, 500],
      availabilityStatus: 'all',
      purchaseDateFrom: undefined,
      purchaseDateTo: undefined,
      hasProjects: false,
      hasNotes: false,
      lowStock: false,
      recentlyAdded: false,
    })
    onClear()
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.searchQuery) count++
    if (filters.producer !== 'all') count++
    if (filters.composition !== 'all') count++
    if (filters.yarnWeight) count++
    if (filters.needleSize !== 'all') count++
    if (filters.store) count++
    if (filters.color) count++
    if (filters.condition !== 'all') count++
    if (filters.batchNumber) count++
    if (filters.availabilityStatus !== 'all') count++
    if (filters.purchaseDateFrom || filters.purchaseDateTo) count++
    if (filters.hasProjects || filters.hasNotes || filters.lowStock || filters.recentlyAdded) count++
    return count
  }

  const activeFilters = getActiveFilterCount()

  return (
    <Card>
      <CardHeader className={compact ? 'py-2' : undefined}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : ''}`}>
              <Search className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
              Avansert søk
            </CardTitle>
            <CardDescription className={compact ? 'text-xs' : undefined}>
              Søk og filtrer garn etter ulike kriterier
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {activeFilters > 0 && (
              <Badge variant="secondary" className={compact ? 'text-[10px] h-5' : undefined}>
                {activeFilters} filter{activeFilters !== 1 ? 'e' : ''}
              </Badge>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className={compact ? 'h-7' : undefined}>
                  <Filter className={compact ? 'h-3 w-3 mr-1.5' : 'h-4 w-4 mr-2'} />
                  {isExpanded ? 'Enkel søk' : 'Avansert'}
                  <ChevronDown className={`ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''} ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <CardContent className={compact ? 'space-y-3 py-2' : 'space-y-6'}>
        {/* Basic Search */}
        <div className={compact ? 'flex gap-2 items-center' : 'flex gap-2'}>
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <Input
              placeholder="Søk i garn, produsent, farge, notater..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className={`pl-10 ${compact ? 'h-8' : ''}`}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading} className={compact ? 'h-8' : undefined}>
            {isLoading ? 'Søker...' : 'Søk'}
          </Button>
          {activeFilters > 0 && (
            <Button variant="outline" onClick={handleClear} className={compact ? 'h-8' : undefined}>
              <X className="h-4 w-4 mr-2" />
              Nullstill
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className={compact ? 'space-y-4' : 'space-y-6'}>
            
            {/* Master Properties */}
            <div className="space-y-4">
              <h3 className={`font-semibold flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                <Package className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                Garn-type egenskaper
              </h3>
              
              <div className={`grid grid-cols-1 md:grid-cols-3 ${compact ? 'gap-3' : 'gap-4'}`}>
                <div>
                  <Label htmlFor="producer">Produsent</Label>
                  <Select value={filters.producer} onValueChange={(value) => updateFilter('producer', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle produsenter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle produsenter</SelectItem>
                      <SelectItem value="Garnstudio">Garnstudio</SelectItem>
                      <SelectItem value="Sandnes Garn">Sandnes Garn</SelectItem>
                      <SelectItem value="Dale Garn">Dale Garn</SelectItem>
                      <SelectItem value="Hobbii">Hobbii</SelectItem>
                      <SelectItem value="Caron">Caron</SelectItem>
                      <SelectItem value="Red Heart">Red Heart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="composition">Fiber</Label>
                  <Select value={filters.composition} onValueChange={(value) => updateFilter('composition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle fiber-typer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle fiber-typer</SelectItem>
                      <SelectItem value="wool">Ull</SelectItem>
                      <SelectItem value="cotton">Bomull</SelectItem>
                      <SelectItem value="acrylic">Akryl</SelectItem>
                      <SelectItem value="merino">Merino</SelectItem>
                      <SelectItem value="alpaca">Alpakka</SelectItem>
                      <SelectItem value="silk">Silke</SelectItem>
                      <SelectItem value="blend">Blanding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="needleSize">Pinner</Label>
                  <Select value={filters.needleSize} onValueChange={(value) => updateFilter('needleSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle størrelser" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle størrelser</SelectItem>
                      <SelectItem value="2.5mm">2.5mm</SelectItem>
                      <SelectItem value="3.0mm">3.0mm</SelectItem>
                      <SelectItem value="3.5mm">3.5mm</SelectItem>
                      <SelectItem value="4.0mm">4.0mm</SelectItem>
                      <SelectItem value="4.5mm">4.5mm</SelectItem>
                      <SelectItem value="5.0mm">5.0mm</SelectItem>
                      <SelectItem value="5.5mm">5.5mm</SelectItem>
                      <SelectItem value="6.0mm">6.0mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Batch Properties */}
            <div className="space-y-4">
              <h3 className={`font-semibold flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                <Palette className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                Batch egenskaper
              </h3>
              
              <div className={`grid grid-cols-1 md:grid-cols-3 ${compact ? 'gap-3' : 'gap-4'}`}>
                <div>
                  <Label htmlFor="color">Farge</Label>
                  <Input
                    placeholder="f.eks. rosa, blå, hvit"
                    value={filters.color}
                    onChange={(e) => updateFilter('color', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="condition">Tilstand</Label>
                  <Select value={filters.condition} onValueChange={(value) => updateFilter('condition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle tilstander" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle tilstander</SelectItem>
                      <SelectItem value="Ny">Ny</SelectItem>
                      <SelectItem value="Brukt - god">Brukt - god</SelectItem>
                      <SelectItem value="Brukt - ok">Brukt - ok</SelectItem>
                      <SelectItem value="Brukt - dårlig">Brukt - dårlig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="batchNumber">Batch nummer</Label>
                  <Input
                    placeholder="f.eks. LOT2024001"
                    value={filters.batchNumber}
                    onChange={(e) => updateFilter('batchNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Quantity and Price */}
            <div className="space-y-4">
              <h3 className={`font-semibold flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                <DollarSign className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                Mengde og pris
              </h3>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? 'gap-4' : 'gap-6'}`}>
                <div className="space-y-2">
                  <Label>Antall nøster: {filters.quantityRange[0]} - {filters.quantityRange[1]}</Label>
                  <Slider
                    value={filters.quantityRange}
                    onValueChange={(value) => updateFilter('quantityRange', value as [number, number])}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pris per nøste: {filters.priceRange[0]} - {filters.priceRange[1]} kr</Label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                    max={500}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="availability">Tilgjengelighet</Label>
                <Select value={filters.availabilityStatus} onValueChange={(value) => updateFilter('availabilityStatus', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="available">Tilgjengelig</SelectItem>
                    <SelectItem value="low">Lav beholdning</SelectItem>
                    <SelectItem value="empty">Tom</SelectItem>
                    <SelectItem value="full">Full beholdning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Filters */}
            <div className="space-y-4">
              <h3 className={`font-semibold flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                <Calendar className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                Datofilter
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kjøpt fra</Label>
                  <DatePicker
                    date={filters.purchaseDateFrom}
                    onDateChange={(date) => updateFilter('purchaseDateFrom', date)}
                  />
                </div>

                <div>
                  <Label>Kjøpt til</Label>
                  <DatePicker
                    date={filters.purchaseDateTo}
                    onDateChange={(date) => updateFilter('purchaseDateTo', date)}
                  />
                </div>
              </div>
            </div>

            {/* Special Filters */}
            <div className="space-y-4">
              <h3 className={compact ? 'text-xs font-semibold' : 'text-sm font-semibold'}>Spesielle filtre</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasProjects"
                      checked={filters.hasProjects}
                      onCheckedChange={(checked) => updateFilter('hasProjects', !!checked)}
                    />
                    <Label htmlFor="hasProjects" className="text-sm">
                      Brukt i prosjekter
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasNotes"
                      checked={filters.hasNotes}
                      onCheckedChange={(checked) => updateFilter('hasNotes', !!checked)}
                    />
                    <Label htmlFor="hasNotes" className="text-sm">
                      Har notater
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowStock"
                      checked={filters.lowStock}
                      onCheckedChange={(checked) => updateFilter('lowStock', !!checked)}
                    />
                    <Label htmlFor="lowStock" className="text-sm">
                      Lav beholdning
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recentlyAdded"
                      checked={filters.recentlyAdded}
                      onCheckedChange={(checked) => updateFilter('recentlyAdded', !!checked)}
                    />
                    <Label htmlFor="recentlyAdded" className="text-sm">
                      Nylig lagt til (siste 30 dager)
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={compact ? 'flex gap-2 pt-3 border-t' : 'flex gap-2 pt-4 border-t'}>
              <Button onClick={handleSearch} disabled={isLoading} className={`flex-1 ${compact ? 'h-9' : ''}`}>
                {isLoading ? 'Søker...' : 'Søk med filtre'}
              </Button>
              <Button variant="outline" onClick={handleClear} className={compact ? 'h-9' : undefined}>
                Nullstill alle filtre
              </Button>
            </div>

          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
