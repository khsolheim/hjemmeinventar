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
  AlertCircle,
  ChevronRight,
  Edit
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FieldSchemaBuilder } from '@/components/categories/FieldSchemaBuilder'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  const [editingFieldsCategory, setEditingFieldsCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const router = useRouter()

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

  const updateFieldSchemaMutation = trpc.categories.updateFieldSchema.useMutation({
    onSuccess: () => {
      toast.success('Kategori-felt oppdatert!')
      setEditingFieldsCategory(null)
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

  const handleFieldSchemaUpdate = (categoryId: string, fieldSchema: any) => {
    updateFieldSchemaMutation.mutate({
      categoryId,
      fieldSchema
    })
  }

  if (isLoading) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Laster kategorier...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Feil ved lasting av kategorier</h3>
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
          <h1 className="text-3xl font-bold title">Kategorier</h1>
          <p className="text-muted-foreground secondary-text">
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
      <div className="cq-grid dashboard-grid gap-4 mb-8" style={{"--card-min":"220px"} as any}>
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
      <div className="cq-grid items-grid gap-6 mb-8" style={{"--card-min":"220px"} as any}>
        {categories.map((category) => (
          <Card key={category.id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
            <div 
              onClick={() => router.push(`/categories/${category.id}`)}
              className="h-full"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="text-2xl">{category.icon || '📦'}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          aria-label={`Mer handlinger for ${category.name}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/categories/${category.id}`)
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Se detaljer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          setEditingFieldsCategory(category.id)
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Rediger felt
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/items?category=${category.id}`)
                        }}>
                          <Package className="w-4 h-4 mr-2" />
                          Administrer gjenstander
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCategory(category.id)
                        }}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Vis statistikker
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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

                {/* Call to Action */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    Klikk for å se detaljer
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {category._count.items}
                    </Badge>
                    {category.fieldSchema && (
                      <Badge variant="outline" className="text-xs">
                        Smart
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
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

      {/* Field Editor */}
      {editingFieldsCategory && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Rediger felt for: {categories.find(c => c.id === editingFieldsCategory)?.name}
              </CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setEditingFieldsCategory(null)}
                disabled={updateFieldSchemaMutation.isPending}
              >
                {updateFieldSchemaMutation.isPending ? 'Lagrer...' : 'Lukk'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FieldSchemaBuilder
              initialSchema={(() => {
                const category = categories.find(c => c.id === editingFieldsCategory)
                if (!category?.fieldSchema) {
                  return null
                }
                try {
                  const schema = typeof category.fieldSchema === 'string' 
                    ? JSON.parse(category.fieldSchema)
                    : category.fieldSchema
                  return schema
                } catch (error) {
                  toast.error(`Feil ved parsing av feltskjema for ${category.name}`)
                  return null
                }
              })()}
              onChange={(schema) => handleFieldSchemaUpdate(editingFieldsCategory, schema)}
              disabled={updateFieldSchemaMutation.isPending}
              categoryName={categories.find(c => c.id === editingFieldsCategory)?.name}
            />
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
