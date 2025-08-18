'use client'

import { useState } from 'react'
import { RemnantCard } from './RemnantCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, SortAsc, Scissors } from 'lucide-react'

interface RemnantGridProps {
  remnants: Array<{
    id: string
    name: string
    description?: string | null
    availableQuantity: number
    unit: string
    categoryData?: string | null
    createdAt: Date
    location?: {
      name: string
    }
    itemRelationsFrom?: Array<{
      toItem: {
        id: string
        name: string
        category?: {
          name: string
        }
      }
    }>
  }>
  loading?: boolean
  onCreateNew?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onUseInProject?: (id: string) => void
  onViewOriginal?: (id: string) => void
}

const conditionLabels = {
  'Excellent': 'Utmerket',
  'Good': 'God',
  'Fair': 'OK',
  'Tangled': 'Floket',
  'Needs sorting': 'Trenger sortering'
}

export function RemnantGrid({ 
  remnants, 
  loading = false,
  onCreateNew,
  onEdit,
  onDelete,
  onUseInProject,
  onViewOriginal
}: RemnantGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [conditionFilter, setConditionFilter] = useState<string>('')
  const [unitFilter, setUnitFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'condition'>('amount')

  // Get unique conditions and units for filters
  const conditions = Array.from(new Set(
    remnants
      .map(r => r.categoryData ? JSON.parse(r.categoryData).condition : null)
      .filter(Boolean)
  ))
  
  const units = Array.from(new Set(remnants.map(r => r.unit)))

  // Filter and sort remnants
  const filteredRemnants = remnants
    .filter(remnant => {
      const matchesSearch = remnant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (remnant.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const remnantData = remnant.categoryData ? JSON.parse(remnant.categoryData) : null
      const matchesCondition = !conditionFilter || remnantData?.condition === conditionFilter
      const matchesUnit = !unitFilter || remnant.unit === unitFilter
      
      return matchesSearch && matchesCondition && matchesUnit
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.availableQuantity - a.availableQuantity
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'condition':
          const aData = a.categoryData ? JSON.parse(a.categoryData) : null
          const bData = b.categoryData ? JSON.parse(b.categoryData) : null
          return (aData?.condition || '').localeCompare(bData?.condition || '')
        default:
          return 0
      }
    })

  // Calculate statistics
  const totalAmount = remnants.reduce((sum, r) => {
    if (r.unit === 'g' || r.unit === 'gram') {
      return sum + r.availableQuantity
    }
    return sum
  }, 0)

  const totalLength = remnants.reduce((sum, r) => {
    if (r.unit === 'm' || r.unit === 'meter') {
      return sum + r.availableQuantity
    }
    return sum
  }, 0)

  const totalSkeins = remnants.reduce((sum, r) => {
    if (r.unit === 'nøste') {
      return sum + r.availableQuantity
    }
    return sum
  }, 0)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Garnrester</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {remnants.length} rester
            </Badge>
            {totalAmount > 0 && (
              <Badge variant="secondary">
                {totalAmount}g total
              </Badge>
            )}
            {totalLength > 0 && (
              <Badge variant="secondary">
                {totalLength}m total
              </Badge>
            )}
            {totalSkeins > 0 && (
              <Badge variant="secondary">
                {totalSkeins} nøster total
              </Badge>
            )}
          </div>
        </div>
        
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Ny rest
          </Button>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søk i garnrester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tilstand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle tilstander</SelectItem>
              {conditions.map(condition => (
                <SelectItem key={condition} value={condition}>
                  {conditionLabels[condition as keyof typeof conditionLabels] || condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Enhet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle enheter</SelectItem>
              {units.map(unit => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-40">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amount">Mengde</SelectItem>
              <SelectItem value="date">Dato</SelectItem>
              <SelectItem value="condition">Tilstand</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      {searchTerm || conditionFilter || unitFilter ? (
        <div className="text-sm text-muted-foreground">
          Viser {filteredRemnants.length} av {remnants.length} rester
        </div>
      ) : null}

      {/* Grid */}
      {filteredRemnants.length === 0 ? (
        <div className="text-center py-12">
          <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-muted-foreground mb-4">
            {searchTerm || conditionFilter || unitFilter 
              ? 'Ingen rester matcher søkekriteriene'
              : 'Ingen garnrester funnet'
            }
          </div>
          {onCreateNew && !searchTerm && !conditionFilter && !unitFilter && (
            <Button onClick={onCreateNew} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Opprett din første garnrest
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRemnants.map((remnant) => (
            <RemnantCard
              key={remnant.id}
              remnant={remnant}
              onEdit={onEdit}
              onDelete={onDelete}
              onUseInProject={onUseInProject}
              onViewOriginal={onViewOriginal}
            />
          ))}
        </div>
      )}
    </div>
  )
}