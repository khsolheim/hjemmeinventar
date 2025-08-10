'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Package, 
  Search, 
  MoreVertical,
  Settings,
  BarChart3,
  Eye,
  Loader2,
  Database,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import Link from 'next/link'

// Category Field Schema Viewer Component
function FieldSchemaViewer({ schema, categoryName }: { schema: any; categoryName: string }) {
  if (!schema || !schema.properties) {
    return (
      <div className="text-sm text-muted-foreground">
        Ingen spesielle felter definert for denne kategorien
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Spesielle felter for {categoryName}:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.entries(schema.properties).map(([key, field]: [string, any]) => (
          <div key={key} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
            <span className="font-medium">{field.label || key}</span>
            <Badge variant="outline" className="text-xs">
              {field.type === 'select' ? 'Valg' : field.type}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // tRPC queries and mutations
  const { data: categories = [], isLoading, error, refetch } = trpc.categories.getAll.useQuery()
  const { data: categoryItems, isLoading: itemsLoading } = trpc.categories.getItems.useQuery(
    { categoryId: selectedCategory!, limit: 20 },
    { enabled: !!selectedCategory }
  )
  const { data: categoryStats } = trpc.categories.getStats.useQuery(
    selectedCategory!,
    { enabled: !!selectedCategory }
  )

  const initializeDefaultsMutation = trpc.categories.initializeDefaults.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.message}. Kategorier: ${result.created.join(', ')}`)
      refetch()
    },
    onError: (error) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const handleInitializeDefaults = () => {
    if (confirm('Dette vil opprette standard-kategorier hvis de ikke allerede eksisterer. Fortsette?')) {
      initializeDefaultsMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Laster kategorier...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Feil ved lasting av kategorier</h3>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Prøv igjen</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kategorier</h1>
          <p className="text-muted-foreground">
            Administrer kategori-system for smartere organisering
          </p>
        </div>
        <div className="flex gap-2">
          <AccessibleButton 
            onClick={handleInitializeDefaults}
            disabled={initializeDefaultsMutation.isPending}
            aria-label="Initialiser standard kategorier"
            variant="outline"
          >
            {initializeDefaultsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Initialiserer...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Initialiser standardkategorier
              </>
            )}
          </AccessibleButton>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Totale kategorier</span>
            </div>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Med gjenstander</span>
            </div>
            <div className="text-2xl font-bold">
              {categories.filter(c => c._count.items > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Med skjemaer</span>
            </div>
            <div className="text-2xl font-bold">
              {categories.filter(c => c.fieldSchema).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tomme kategorier</span>
            </div>
            <div className="text-2xl font-bold">
              {categories.filter(c => c._count.items === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{category.icon || '📦'}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label={`Mer handlinger for ${category.name}`}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedCategory(category.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Se gjenstander
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      // Navigate to items page with category filter
                      window.location.href = `/items?category=${category.id}`
                    }}>
                      <Package className="w-4 h-4 mr-2" />
                      Administrer gjenstander
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedCategory(category.id)}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Vis statistikker
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Item Count and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {category._count.items} gjenstander
                  </span>
                </div>
                {category.fieldSchema && (
                  <Badge variant="secondary" className="text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    Smart kategori
                  </Badge>
                )}
              </div>

              {/* Field Schema Preview */}
              {category.fieldSchema && (
                <FieldSchemaViewer 
                  schema={category.fieldSchema} 
                  categoryName={category.name}
                />
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Link href={`/items?category=${category.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Package className="w-3 h-3 mr-1" />
                    Se gjenstander
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <BarChart3 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Category Details */}
      {selectedCategory && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Kategoridetaler: {categories.find(c => c.id === selectedCategory)?.name}
              </CardTitle>
              <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                Lukk
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Laster gjenstander...</span>
              </div>
            ) : categoryItems?.items && categoryItems.items.length > 0 ? (
              <div className="space-y-4">
                {/* Category Stats */}
                {categoryStats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Totale gjenstander</div>
                      <div className="text-2xl font-bold">{categoryStats.totalItems}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total verdi</div>
                      <div className="text-2xl font-bold">{Number(categoryStats.totalValue)} kr</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Gjennomsnittspris</div>
                      <div className="text-2xl font-bold">
                        {categoryStats.totalItems > 0 
                          ? Math.round(Number(categoryStats.totalValue) / categoryStats.totalItems)
                          : 0
                        } kr
                      </div>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div>
                  <h4 className="font-medium mb-3">Gjenstander i kategorien ({categoryItems.total}):</h4>
                  <div className="space-y-2">
                    {categoryItems.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-medium">{item.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              {item.availableQuantity} {item.unit} • {item.location.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.tags.map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          <Link href={`/items?search=${item.name}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  {categoryItems.total > categoryItems.items.length && (
                    <div className="text-center mt-4">
                      <Link href={`/items?category=${selectedCategory}`}>
                        <Button variant="outline">
                          Se alle {categoryItems.total} gjenstander
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ingen gjenstander i denne kategorien ennå</p>
                <Link href={`/items?category=${selectedCategory}`} className="mt-4 inline-block">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Legg til første gjenstand
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">Ingen kategorier funnet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Initialiser standard kategorier for å komme i gang med smart organisering
          </p>
          <AccessibleButton 
            onClick={handleInitializeDefaults}
            disabled={initializeDefaultsMutation.isPending}
            aria-label="Initialiser standard kategorier"
          >
            {initializeDefaultsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Initialiserer...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Initialiser standardkategorier
              </>
            )}
          </AccessibleButton>
        </div>
      )}
    </div>
  )
}
