'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft,
  Plus, 
  Package, 
  Search, 
  MoreVertical,
  Settings,
  BarChart3,
  Grid,
  List,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Archive,
  Check
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldSchemaBuilder } from '@/components/categories/FieldSchemaBuilder'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import Link from 'next/link'

interface CategoryDetailPageProps {}

export default function CategoryDetailPage({}: CategoryDetailPageProps) {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.categoryId as string

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isEditingFields, setIsEditingFields] = useState(false)

  // tRPC queries
  const { data: category, isLoading: categoryLoading, error: categoryError, refetch: refetchCategory } = trpc.categories.getById.useQuery(categoryId)
  const { data: itemsData, isLoading: itemsLoading, refetch: refetchItems } = trpc.categories.getItems.useQuery({
    categoryId,
    limit: 50
  })
  const { data: categoryStats, refetch: refetchStats } = trpc.categories.getStats.useQuery(categoryId)
  


  // tRPC mutations
  const updateFieldSchemaMutation = trpc.categories.updateFieldSchema.useMutation({
    onSuccess: () => {
      toast.success('Kategori-felt oppdatert!')
      // Don't automatically close edit mode - let user decide when they're done
      // setIsEditingFields(false)
      // Refetch category to get updated schema without page reload
      refetchCategory()
      refetchItems()
      refetchStats()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  // Extract items from response
  const items = itemsData?.items || []
  const totalItems = itemsData?.total || 0

  // Parse field schema if it exists
  const fieldSchema = useMemo(() => {
    if (!category?.fieldSchema) return null
    
    try {
      if (typeof category.fieldSchema === 'string') {
        return JSON.parse(category.fieldSchema)
      } else if (typeof category.fieldSchema === 'object') {
        return category.fieldSchema
      }
      return null
    } catch (error) {
      console.error('Failed to parse field schema:', error)
      return null
    }
  }, [category?.fieldSchema])

  // Handler for updating field schema
  const handleFieldSchemaUpdate = useCallback((newSchema: any) => {
    updateFieldSchemaMutation.mutate({
      categoryId,
      fieldSchema: newSchema
    })
  }, [categoryId, updateFieldSchemaMutation])

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (categoryLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Laster kategori...</span>
        </div>
      </div>
    )
  }

  if (categoryError || !category) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Feil ved lasting av kategori</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {categoryError?.message || 'Kategori ikke funnet'}
          </p>
          <Button onClick={() => router.push('/categories')}>
            Tilbake til kategorier
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8">
      {/* Header with navigation */}
      <div className="flex items-center gap-4 mb-6 cq">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/categories')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Tilbake til kategorier
        </Button>
        
        <div className="text-sm text-muted-foreground">
          <Link href="/categories" className="hover:text-foreground">
            Kategorier
          </Link>
          {' / '}
          <span className="text-foreground font-medium">{category.name}</span>
        </div>
      </div>

      {/* Category Header */}
      <div className="flex items-start justify-between mb-8 cq">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-3xl">{category.icon || '📦'}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground mb-3">{category.description}</p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <Package className="w-3 h-3" />
                {totalItems} gjenstander
              </Badge>
              {fieldSchema && (
                <Badge variant="outline" className="gap-1">
                  <Settings className="w-3 h-3" />
                  Smart kategori
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              refetchCategory()
              refetchItems()
              refetchStats()
              toast.success('Data oppdatert!')
            }}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Oppdater
          </Button>
          <Link href={`/items/new?category=${categoryId}`}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Legg til gjenstand
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Rediger kategori
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="w-4 h-4 mr-2" />
                Vis detaljert statistikk
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Archive className="w-4 h-4 mr-2" />
                Arkiver kategori
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Category-specific field schema display/editor */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Kategori-spesifikke felt
              </CardTitle>
              <CardDescription>
                {isEditingFields 
                  ? "Rediger feltene som vil dukke opp automatisk når du registrerer gjenstander"
                  : "Disse feltene vil dukke opp automatisk når du registrerer gjenstander i denne kategorien"
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isEditingFields ? (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingFields(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Rediger felt
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      refetchCategory()
                      toast.success('Data oppdatert!')
                    }}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Oppdater
                  </Button>
                  <Button 
                    onClick={() => setIsEditingFields(false)}
                    disabled={updateFieldSchemaMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Ferdig
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditingFields(false)}
                    disabled={updateFieldSchemaMutation.isPending}
                  >
                    Avbryt
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isEditingFields ? (
            // Display mode
            fieldSchema && Object.keys(fieldSchema.properties || {}).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(fieldSchema.properties || {}).map(([key, field]: [string, any]) => (
                  <div key={key} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">{field.label || key}</div>
                    <div className="text-xs text-muted-foreground">
                      Type: {field.type}
                      {field.options && ' (dropdown)'}
                      {fieldSchema.required?.includes(key) && ' · Påkrevd'}
                    </div>
                    {field.options && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Valg: {field.options.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Ingen kategori-spesifikke felt definert</p>
                <p className="text-sm">Klikk "Rediger felt" for å legge til felt som automatisk vil dukke opp under item-registrering</p>
              </div>
            )
          ) : (
            // Edit mode
            <FieldSchemaBuilder
              key={`edit-${categoryId}-${isEditingFields}`}
              initialSchema={fieldSchema}
              onChange={handleFieldSchemaUpdate}
              disabled={updateFieldSchemaMutation.isPending}
              categoryName={category?.name}
            />
          )}
        </CardContent>
      </Card>

      {/* Search and filters */}
      <div className="flex items-center justify-between gap-4 mb-6 cq">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Søk i gjenstander..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Navn</SelectItem>
              <SelectItem value="createdAt">Opprettet</SelectItem>
              <SelectItem value="updatedAt">Oppdatert</SelectItem>
              <SelectItem value="price">Pris</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Items display */}
      {itemsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Laster gjenstander...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? 'Ingen gjenstander funnet' : 'Ingen gjenstander i denne kategorien'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'Prøv å endre søkekriteriene dine'
              : 'Få i gang inventaret ditt ved å legge til den første gjenstanden'
            }
          </p>
          <Link href={`/items/new?category=${categoryId}`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Legg til gjenstand
            </Button>
          </Link>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "cq-grid items-grid gap-4"
          : "space-y-4"
        } style={viewMode === 'grid' ? ({"--card-min":"220px"} as any) : undefined}>
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                    {item.description && (
                      <CardDescription className="line-clamp-2">
                        {item.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/items/${item.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Se detaljer
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/items/${item.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Rediger
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Slett
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package className="w-3 h-3" />
                    <span>{item.totalQuantity} {item.unit}</span>
                  </div>
                  {item.price && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="w-3 h-3" />
                      <span>{item.price} kr</span>
                    </div>
                  )}
                </div>
                
                {item.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{item.location.name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Lagt til {new Date(item.createdAt).toLocaleDateString('no-NO')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
