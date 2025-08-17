'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Package2, DollarSign, Palette, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { YarnWizard } from './YarnWizard'
import { AdvancedYarnSearch } from './AdvancedYarnSearch'
import { YarnAnalytics } from './YarnAnalytics'
import { YarnBulkOperations } from './YarnBulkOperations'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'

export interface YarnMasterWithTotals {
  id: string
  name: string
  description: string | null
  categoryData: string | null
  location: {
    id: string
    name: string
  }
  totals: {
    totalSkeins: number
    availableSkeins: number
    totalValue: number
    batchCount: number
  }
  createdAt: Date
}

export function YarnMasterDashboard({ initialMasters, initialTotal }: { initialMasters?: YarnMasterWithTotals[]; initialTotal?: number }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFilters, setSearchFilters] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'grid' | 'list' | 'bulk' | 'analytics' | 'colors'>('grid')

  // Fetch yarn masters
  const useSearchApi = Boolean((searchFilters && Object.keys(searchFilters).length > 0) || (searchTerm && searchTerm.trim().length > 0))
  const { data: mastersData, isLoading: isLoadingAll, refetch } = trpc.yarn.getAllMasters.useQuery({
    limit: 50,
    offset: 0,
    search: useSearchApi ? undefined : (searchTerm || undefined),
    filters: useSearchApi ? undefined : (searchFilters || undefined)
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 30000,
    keepPreviousData: true,
    enabled: !useSearchApi,
    initialData: initialMasters ? { masters: initialMasters, total: initialTotal ?? initialMasters.length } : undefined
  })

  const { data: mastersSearchData, isLoading: isLoadingSearch } = trpc.yarn.searchMasters.useQuery({
    limit: 50,
    offset: 0,
    search: searchTerm || undefined,
    filters: searchFilters || undefined,
  }, {
    enabled: useSearchApi,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0,
    keepPreviousData: false,
  })

  const handleAdvancedSearch = (filters: any) => {
    setSearchFilters(filters)
    setSearchTerm(filters.searchQuery)
    refetch()
  }

  const handleClearSearch = () => {
    setSearchFilters(null)
    setSearchTerm('')
    refetch()
  }

  const masters = ((useSearchApi ? mastersSearchData?.masters : mastersData?.masters) || initialMasters) || []
  const total = useSearchApi ? (mastersSearchData?.total ?? 0) : (mastersData?.total ?? initialTotal ?? 0)

  const { data: allColors, refetch: refetchColors } = trpc.yarn.getAllMasterColors.useQuery(
    {},
    {
      enabled: activeTab === 'colors',
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
      gcTime: 0,
    }
  )

  useEffect(() => {
    if (activeTab === 'colors') {
      refetchColors()
    }
  }, [activeTab, refetchColors])

  // Calculate overall statistics
  const overallStats = masters.reduce((acc, master) => {
    const totals = master.totals || { totalSkeins: 0, totalValue: 0, batchCount: 0 }
    return {
      totalMasters: acc.totalMasters + 1,
      totalSkeins: acc.totalSkeins + (totals.totalSkeins || 0),
      totalValue: acc.totalValue + (totals.totalValue || 0),
      totalBatches: acc.totalBatches + (totals.batchCount || 0)
    }
  }, { totalMasters: 0, totalSkeins: 0, totalValue: 0, totalBatches: 0 })

  // Wizard is now a dedicated page. Refetch happens when returning to this page.

  const getMasterData = (categoryData: string | null) => {
    if (!categoryData) return {}
    try {
      return JSON.parse(categoryData)
    } catch {
      return {}
    }
  }

  if (isLoadingAll || isLoadingSearch) {
    return (
      <div className="cq space-y-2">
        <div className="flex justify-between items-center py-1">
          <div>
            <div className="h-6 bg-muted rounded w-40" />
            <div className="h-3 bg-muted rounded w-64 mt-2" />
          </div>
          <div className="h-9 bg-muted rounded w-40" />
        </div>
        <div className="cq-grid yarn-grid gap-6" style={{"--card-min":"220px"} as any}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="min-h-[220px] animate-pulse">
              <CardHeader className="min-h-[56px]">
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent className="min-h-[120px]">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="mt-4 h-2 bg-muted rounded-full w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="cq space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center py-1">
        <div>
          <h1 className="text-2xl font-bold leading-none">Garn Oversikt</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administrer dine garn-typer og batches
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/garn/manage">
              Administrer
            </Link>
          </Button>
          <Button asChild>
            <Link href="/garn/register">
              <Plus className="h-4 w-4 mr-2" />
              Registrer Nytt Garn
            </Link>
          </Button>
        </div>
      </div>



      {/* Advanced Search */}
      <div className="min-h-[64px]">
        <AdvancedYarnSearch 
          onSearch={handleAdvancedSearch}
          onClear={handleClearSearch}
          isLoading={isLoadingAll || isLoadingSearch}
          compact
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList className="min-h-[44px]">
          <TabsTrigger value="grid">Rutenett</TabsTrigger>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="bulk">Bulk-ops</TabsTrigger>
          <TabsTrigger value="analytics">Analyse</TabsTrigger>
          <TabsTrigger value="colors">Farger</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4 cq">
          {masters.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen garn registrert</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Kom i gang ved å registrere ditt første garn.
                </p>
                <Button asChild>
                  <Link href="/garn/register">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrer Garn
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="cq-grid yarn-grid gap-6 min-h-[800px]" style={{"--card-min":"220px"} as any}>
              {masters.map((master) => {
                const data = getMasterData(master.categoryData)
                return (
                  <Link key={master.id} href={`/garn/${master.id}`} className="block">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow min-h-[220px]">
                      <CardHeader className="min-h-[56px]">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{master.name}</CardTitle>
                          <CardDescription>
                            {data.producer} • {data.composition}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {master.totals?.batchCount || 0} batches
                        </Badge>
                      </div>
                      </CardHeader>
                      <CardContent className="min-h-[120px]">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Nøster:</span>
                          <span className="font-medium">
                            {master.totals?.availableSkeins || 0} / {master.totals?.totalSkeins || 0}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Verdi:</span>
                          <span className="font-medium">
                            {(master.totals?.totalValue || 0).toFixed(0)} kr
                          </span>
                        </div>

                        {data.needleSize && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pinner:</span>
                            <span className="font-medium">{data.needleSize}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Lokasjon:</span>
                          <span className="font-medium">{master.location.name}</span>
                        </div>
                      </div>


                      {/* Progress bar showing available vs total */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Tilgjengelig</span>
                          <span>
                            {Math.round(((master.totals?.availableSkeins || 0) / (master.totals?.totalSkeins || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ 
                              width: `${Math.round(((master.totals?.availableSkeins || 0) / (master.totals?.totalSkeins || 1)) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {masters.map((master) => {
                  const data = getMasterData(master.categoryData)
                  return (
                    <Link 
                      key={master.id}
                      href={`/garn/${master.id}`}
                      className="block p-4 hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{master.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {data.producer} • {data.composition}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-medium">{master.totals?.batchCount || 0}</div>
                            <div className="text-muted-foreground">Batches</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">
                              {master.totals?.availableSkeins || 0}/{master.totals?.totalSkeins || 0}
                            </div>
                            <div className="text-muted-foreground">Nøster</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{(master.totals?.totalValue || 0).toFixed(0)} kr</div>
                            <div className="text-muted-foreground">Verdi</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <YarnBulkOperations 
            items={masters}
            onRefresh={refetch}
            itemType="masters"
          />
        </TabsContent>

        <TabsContent value="analytics">
          <YarnAnalytics overallStats={overallStats} />
        </TabsContent>

        <TabsContent value="colors" className="space-y-4 cq">
          <Card>
            <CardHeader>
              <CardTitle>Alle farger</CardTitle>
              <CardDescription>Samlet oversikt over farger på tvers av alle garntyper</CardDescription>
            </CardHeader>
            <CardContent>
              {!allColors || allColors.length === 0 ? (
                <div className="text-sm text-muted-foreground">Ingen farger funnet.</div>
              ) : (
                <div className="cq-grid yarn-grid gap-4" style={{"--card-min":"200px"} as any}>
                  {allColors.map((c: any, index: number) => {
                    const href = c.colorId ? `/garn/${c.masterId}/farge/${c.colorId}` : `/garn/${c.masterId}`
                    return (
                    <Link key={`${c.masterId}-${c.colorId || c.colorName}-${index}`} href={href} className="block">
                    <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {c.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.imageUrl}
                              alt={`${c.masterName} – ${c.colorName}`}
                              className="w-10 h-10 rounded object-cover border"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded border"
                              style={{ backgroundColor: c.colorCode || '#ddd' }}
                            />
                          )}
                          <div>
                            <div className="font-medium text-sm">{c.masterName} – {c.colorName}</div>
                            <div className="text-xs text-muted-foreground">{c.colorCode || 'Ukjent kode'}</div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{c.batchCount} batches</Badge>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">Tilgjengelige nøster: {c.skeinCount}</div>
                    </Card>
                    </Link>
                    )})}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Master Detail moved to dedicated route /garn/[id] */}
    </div>
  )
}
