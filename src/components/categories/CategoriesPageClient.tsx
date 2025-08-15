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
  const router = useRouter()

  const { data: categories = [], isLoading, error, refetch } = trpc.categories.getAll.useQuery(undefined, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
    initialData: initialCategories,
  })
  const { data: categoryItems, isLoading: itemsLoading } = trpc.categories.getItems.useQuery(
    { categoryId: selectedCategory!, limit: 20 },
    { enabled: !!selectedCategory, staleTime: 30000, refetchOnWindowFocus: false, refetchOnMount: false, keepPreviousData: true }
  )
  const { data: categoryStats } = trpc.categories.getStats.useQuery(
    selectedCategory!,
    { enabled: !!selectedCategory, staleTime: 30000, refetchOnWindowFocus: false, refetchOnMount: false, keepPreviousData: true }
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

  if (isLoading && (!categories || categories.length === 0)) {
    return (
      <div className="page container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 cq">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-72 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-56 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <div className="cq-grid dashboard-grid gap-4 mb-8" style={{"--card-min":"220px"} as any}>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 min-h-16">
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="cq-grid items-grid gap-6 mb-8 min-h-[60vh]" style={{"--card-min":"220px"} as any}>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-56 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 min-h-24">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-5 w-20 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
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
          <CardContent className="p-4 min-h-16">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Totale kategorier</span>
            </div>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 min-h-16">
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
          <CardContent className="p-4 min-h-16">
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
          <CardContent className="p-4 min-h-16">
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
      <div className="cq-grid items-grid gap-6 mb-8 min-h-[60vh]" style={{"--card-min":"220px"} as any}>
        {categories.map((category) => (
          <Card key={category.id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
            <Link href={`/categories/${category.id}`} className="h-full block">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="text-2xl">{(category as any).icon || '📦'}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {(category as any).description}
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
              
              <CardContent className="space-y-4 min-h-28">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {category._count.items} gjenstander
                    </span>
                  </div>
                  {(category as any).fieldSchema && (
                    <Badge variant="secondary" className="text-xs">
                      <Settings className="w-3 h-3 mr-1" />
                      Smart kategori
                    </Badge>
                  )}
                </div>
                {(category as any).fieldSchema && (
                  <div className="table-wrap">
                    <FieldSchemaBuilder 
                      // View-only preview via existing viewer is complex; keep compact badge only to minimize layout jumps
                      initialSchema={(category as any).fieldSchema}
                      onChange={() => {}}
                      disabled
                      categoryName={category.name}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">Klikk for å se detaljer</div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {category._count.items}
                    </Badge>
                    {(category as any).fieldSchema && (
                      <Badge variant="outline" className="text-xs">Smart</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}


