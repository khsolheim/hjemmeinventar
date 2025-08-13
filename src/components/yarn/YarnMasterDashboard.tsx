'use client'

import { useState } from 'react'
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

interface YarnMasterWithTotals {
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

export function YarnMasterDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFilters, setSearchFilters] = useState<any>(null)

  // Fetch yarn masters
  const { data: mastersData, isLoading, refetch } = trpc.yarn.getAllMasters.useQuery({
    limit: 50,
    offset: 0,
    search: searchTerm || undefined,
    filters: searchFilters || undefined
  }, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0 // Always refetch to ensure fresh data
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

  const masters = mastersData?.masters || []
  const total = mastersData?.total || 0

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Garn Oversikt</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center py-1">
        <div>
          <h1 className="text-2xl font-bold leading-none">Garn Oversikt</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administrer dine garn-typer og batches
          </p>
        </div>
        <Button asChild>
          <Link href="/garn/register">
            <Plus className="h-4 w-4 mr-2" />
            Registrer Nytt Garn
          </Link>
        </Button>
      </div>

      {/* Statistics Cards - compact */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
        <Card className="py-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1 px-3">
            <CardTitle className="text-xs font-medium">Garn-typer</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-1 px-3">
            <div className="text-lg font-bold leading-none">{overallStats.totalMasters}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Forskjellige garntyper
            </p>
          </CardContent>
        </Card>

        <Card className="py-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1 px-3">
            <CardTitle className="text-xs font-medium">Totalt Nøster</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-1 px-3">
            <div className="text-lg font-bold leading-none">{overallStats.totalSkeins}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              På tvers av alle typer
            </p>
          </CardContent>
        </Card>

        <Card className="py-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1 px-3">
            <CardTitle className="text-xs font-medium">Total Verdi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-1 px-3">
            <div className="text-lg font-bold leading-none">{overallStats.totalValue.toFixed(0)} kr</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Estimert beholdningsverdi
            </p>
          </CardContent>
        </Card>

        <Card className="py-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-1 px-3">
            <CardTitle className="text-xs font-medium">Batches</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-1 px-3">
            <div className="text-lg font-bold leading-none">{overallStats.totalBatches}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Unike farge-batches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Search */}
      <AdvancedYarnSearch 
        onSearch={handleAdvancedSearch}
        onClear={handleClearSearch}
        isLoading={isLoading}
        compact
      />

      {/* Main Content */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Rutenett</TabsTrigger>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="bulk">Bulk-ops</TabsTrigger>
          <TabsTrigger value="analytics">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {masters.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ingen garn registrert</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Kom i gang ved å registrere ditt første garn.
                </p>
                <Button onClick={() => setIsWizardOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrer Garn
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {masters.map((master) => {
                const data = getMasterData(master.categoryData)
                return (
                  <Link key={master.id} href={`/garn/${master.id}`} className="block">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
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
                      <CardContent>
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
          <YarnAnalytics />
        </TabsContent>
      </Tabs>

      {/* Master Detail moved to dedicated route /garn/[id] */}
    </div>
  )
}
