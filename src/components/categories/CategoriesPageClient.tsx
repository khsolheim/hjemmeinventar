'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Package, 
  MoreVertical,
  Settings,
  BarChart3,
  Eye,
  Loader2,
  Database,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Edit,
  Grid3x3,
  FolderOpen,
  Sparkles,
  Users,
  Calendar,
  Search
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { FieldSchemaBuilder } from '@/components/categories/FieldSchemaBuilder'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type InitialCategory = {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  fieldSchema?: any | null
  _count: { items: number }
}

export function CategoriesPageClient({ initialCategories }: { initialCategories?: InitialCategory[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [editingFieldsCategory, setEditingFieldsCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const router = useRouter()

  const categoriesQuery = trpc.categories.getAll.useQuery(undefined, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev: any) => prev,
    initialData: initialCategories as any,
  })
  const { data: categories, isLoading, error, refetch } = categoriesQuery
  const categoryItemsQuery = trpc.categories.getItems.useQuery(
    { categoryId: selectedCategory!, limit: 20 },
    { enabled: !!selectedCategory, staleTime: 30000, refetchOnWindowFocus: false, refetchOnMount: false, placeholderData: (prev: any) => prev }
  )
  const { data: categoryItems, isLoading: itemsLoading } = categoryItemsQuery
  const categoryStatsQuery = trpc.categories.getStats.useQuery(
    selectedCategory!,
    { enabled: !!selectedCategory, staleTime: 30000, refetchOnWindowFocus: false, refetchOnMount: false, placeholderData: (prev: any) => prev }
  )
  const { data: categoryStats } = categoryStatsQuery

  const initializeDefaultsMutation = trpc.categories.initializeDefaults.useMutation({
    onSuccess: (result: any) => {
      toast.success(`${result.message}. Kategorier: ${result.created.join(', ')}`)
      refetch()
    },
    onError: (error: any) => {
      toast.error(`Feil: ${error.message}`)
    }
  })

  const updateFieldSchemaMutation = trpc.categories.updateFieldSchema.useMutation({
    onSuccess: () => {
      toast.success('Kategori-felt oppdatert!')
      setEditingFieldsCategory(null)
      refetch()
    },
    onError: (error: any) => {
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

  // Filter categories based on search and active tab
  const filteredCategories = categories?.filter((category: any) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (activeTab === 'all') return matchesSearch
    if (activeTab === 'with-items') return matchesSearch && category._count.items > 0
    if (activeTab === 'empty') return matchesSearch && category._count.items === 0
    if (activeTab === 'smart') return matchesSearch && category.fieldSchema
    return matchesSearch
  }) || []

  // Statistics
  const totalCategories = categories?.length || 0
  const categoriesWithItems = categories?.filter((c: any) => c._count.items > 0).length || 0
  const smartCategories = categories?.filter((c: any) => c.fieldSchema).length || 0
  const emptyCategories = categories?.filter((c: any) => c._count.items === 0).length || 0

  if (isLoading && (!categories || categories.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-72 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Categories Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Feil ved lasting av kategorier</h3>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Button onClick={() => refetch()} className="w-full">
            Prøv igjen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Grid3x3 className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Kategorier
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Organiser og administrer kategorier for smartere gjenstandshåndtering
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Søk i kategorier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <AccessibleButton 
              onClick={handleInitializeDefaults}
              disabled={initializeDefaultsMutation.isPending}
              aria-label="Initialiser standard kategorier"
              variant="outline"
              className="whitespace-nowrap"
            >
              {initializeDefaultsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initialiserer...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Standardkategorier
                </>
              )}
            </AccessibleButton>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Grid3x3 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Totale kategorier</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{totalCategories}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-green-500/20 hover:border-green-500/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Med gjenstander</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{categoriesWithItems}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Smart kategorier</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{smartCategories}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-orange-500/20 hover:border-orange-500/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Tomme kategorier</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{emptyCategories}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Alle ({totalCategories})
            </TabsTrigger>
            <TabsTrigger value="with-items" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Med gjenstander ({categoriesWithItems})
            </TabsTrigger>
            <TabsTrigger value="empty" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Tomme ({emptyCategories})
            </TabsTrigger>
            <TabsTrigger value="smart" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Smart ({smartCategories})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? 'Ingen kategorier funnet' : 'Ingen kategorier'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? `Ingen kategorier matcher "${searchTerm}"`
                    : 'Start med å opprette standardkategorier eller legg til nye kategorier manuelt.'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleInitializeDefaults} disabled={initializeDefaultsMutation.isPending}>
                    <Database className="w-4 h-4 mr-2" />
                    Opprett standardkategorier
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category: any) => (
                  <Card 
                    key={category.id} 
                    className="group bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 hover:shadow-xl hover:scale-[1.02]"
                  >
                    <Link href={`/categories/${category.id}`} className="h-full block">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                              <span className="text-2xl">{(category as any).icon || '📦'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                                {category.name}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 mt-1">
                                {(category as any).description || 'Ingen beskrivelse'}
                              </CardDescription>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={`Mer handlinger for ${category.name}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                              <DropdownMenuSeparator />
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
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {category._count.items} gjenstander
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {(category as any).fieldSchema && (
                              <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-700 border-purple-500/20">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Smart
                              </Badge>
                            )}
                            {category._count.items === 0 && (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-500/30">
                                Tom
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {(category as any).fieldSchema && (
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Settings className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Smart felter</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {Object.keys((category as any).fieldSchema.properties || {}).slice(0, 3).map((key: string) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}
                                </Badge>
                              ))}
                              {Object.keys((category as any).fieldSchema.properties || {}).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{Object.keys((category as any).fieldSchema.properties || {}).length - 3} mer
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <div className="text-xs text-muted-foreground">Klikk for å se detaljer</div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Field Schema Editor Modal */}
        {editingFieldsCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Rediger kategori-felt</CardTitle>
                <CardDescription>
                  Definer spesielle felter for denne kategorien
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FieldSchemaBuilder
                  initialSchema={null}
                  onChange={(schema) => handleFieldSchemaUpdate(editingFieldsCategory, schema)}
                  categoryName=""
                />
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => setEditingFieldsCategory(null)}
                    variant="outline"
                  >
                    Avbryt
                  </Button>
                  <Button 
                    onClick={() => setEditingFieldsCategory(null)}
                  >
                    Lagre
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}


