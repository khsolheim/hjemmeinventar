'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
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

type InitialItem = {
  id: string
  name: string
  description?: string | null
  unit?: string | null
  price?: number | null
  createdAt: string | Date
  location?: { id: string, name: string } | null
  tags: Array<{ id: string, name: string }>
}

type InitialCategory = {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  fieldSchema?: any | null
}

export function CategoryDetailClient({
  categoryId,
  initialCategory,
  initialItems,
  initialTotal,
  initialTotalValue,
}: {
  categoryId: string
  initialCategory?: InitialCategory | null
  initialItems?: { items: InitialItem[], total: number }
  initialTotal?: number
  initialTotalValue?: number
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isEditingFields, setIsEditingFields] = useState(false)

  const { data: category, isLoading: categoryLoading, error: categoryError, refetch: refetchCategory } = trpc.categories.getById.useQuery(categoryId, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
    initialData: (initialCategory as any) ?? undefined,
  })
  const { data: itemsData, isLoading: itemsLoading, refetch: refetchItems } = trpc.categories.getItems.useQuery({
    categoryId,
    limit: 50
  }, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
    initialData: (initialItems as any) ?? undefined,
  })
  const { data: categoryStats, refetch: refetchStats } = trpc.categories.getStats.useQuery(categoryId, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
    initialData: initialTotal !== undefined && initialTotalValue !== undefined ? {
      totalItems: initialTotal,
      totalValue: initialTotalValue,
    } as any : undefined,
  })

  const updateFieldSchemaMutation = trpc.categories.updateFieldSchema.useMutation({
    onSuccess: () => {
      toast.success('Kategori-felt oppdatert!')
      refetchCategory(); refetchItems(); refetchStats()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const items = itemsData?.items || []
  const totalItems = itemsData?.total || 0

  const fieldSchema = useMemo(() => {
    if (!category?.fieldSchema) return null
    try {
      if (typeof category.fieldSchema === 'string') return JSON.parse(category.fieldSchema)
      if (typeof category.fieldSchema === 'object') return category.fieldSchema
      return null
    } catch {
      return null
    }
  }, [category?.fieldSchema])

  const handleFieldSchemaUpdate = useCallback((newSchema: any) => {
    updateFieldSchemaMutation.mutate({ categoryId, fieldSchema: newSchema })
  }, [categoryId, updateFieldSchemaMutation])

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (categoryLoading && !category) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6 cq">
          <div className="h-9 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-start justify-between mb-8 cq">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-muted rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-64 bg-muted rounded animate-pulse" />
              <div className="h-4 w-72 bg-muted rounded animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="h-6 w-28 bg-muted rounded animate-pulse" />
                <div className="h-6 w-28 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-muted rounded animate-pulse" />
            <div className="h-9 w-36 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg min-h-24">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-6 w-16 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="cq-grid items-grid gap-4 mt-6" style={{"--card-min":"220px"} as any}>
          {[...Array(6)].map((_, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-56 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-6 bg-muted rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (categoryError || !category) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Feil ved lasting av kategori</h3>
          <Button onClick={() => router.push('/categories')}>Tilbake til kategorier</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page container mx-auto px-4 py-8">
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
          <Link href="/categories" className="hover:text-foreground">Kategorier</Link>
          {' / '}
          <span className="text-foreground font-medium">{category.name}</span>
        </div>
      </div>

      <div className="flex items-start justify-between mb-8 cq">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-3xl">{(category as any).icon || '📦'}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground mb-3">{(category as any).description}</p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <Package className="w-3 h-3" />
                {totalItems} gjenstander
              </Badge>
              {category.fieldSchema && (
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
            onClick={() => { refetchCategory(); refetchItems(); refetchStats(); toast.success('Data oppdatert!') }}
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
        </div>
      </div>

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
                  ? 'Rediger feltene som vil dukke opp automatisk når du registrerer gjenstander'
                  : 'Disse feltene vil dukke opp automatisk når du registrerer gjenstander i denne kategorien'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isEditingFields ? (
                <Button variant="outline" onClick={() => setIsEditingFields(true)} className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Rediger felt
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { refetchCategory(); toast.success('Data oppdatert!') }} size="sm" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Oppdater
                  </Button>
                  <Button onClick={() => setIsEditingFields(false)} disabled={updateFieldSchemaMutation.isPending} className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Ferdig
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingFields(false)} disabled={updateFieldSchemaMutation.isPending}>Avbryt</Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isEditingFields ? (
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
                      <div className="text-xs text-muted-foreground mt-1">Valg: {field.options.join(', ')}</div>
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
            <div className="table-wrap">
              <FieldSchemaBuilder
                key={`edit-${categoryId}-${isEditingFields}`}
                initialSchema={fieldSchema}
                onChange={handleFieldSchemaUpdate}
                disabled={updateFieldSchemaMutation.isPending}
                categoryName={category?.name}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 mb-6 cq">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Søk i gjenstander..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
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
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {itemsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Laster gjenstander...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{searchQuery ? 'Ingen gjenstander funnet' : 'Ingen gjenstander i denne kategorien'}</h3>
          <p className="text-muted-foreground mb-4">{searchQuery ? 'Prøv å endre søkekriteriene dine' : 'Få i gang inventaret ditt ved å legge til den første gjenstanden'}</p>
          <Link href={`/items/new?category=${categoryId}`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Legg til gjenstand
            </Button>
          </Link>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'cq-grid items-grid gap-4' : 'space-y-4'} style={viewMode === 'grid' ? ({'--card-min': '220px'} as any) : undefined}>
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
                    {item.description && (
                      <CardDescription className="line-clamp-2">{item.description}</CardDescription>
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
                    <span>{(item as any).totalQuantity} {(item as any).unit}</span>
                  </div>
                  {(item as any).price && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="w-3 h-3" />
                      <span>{(item as any).price} kr</span>
                    </div>
                  )}
                </div>
                {(item as any).location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{(item as any).location?.name}</span>
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


