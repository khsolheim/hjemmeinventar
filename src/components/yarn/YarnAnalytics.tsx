'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Palette, Clock, Eye, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'

interface YarnAnalyticsProps {
  className?: string
}

export function YarnAnalytics({ className }: YarnAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30') // days
  const [groupBy, setGroupBy] = useState('producer') // producer, color, store, etc.

  // Fetch analytics data
  const { data: analyticsData, isLoading } = trpc.yarn.getYarnAnalytics.useQuery({
    timeRange: parseInt(timeRange),
    groupBy
  })

  const { data: stockAlerts } = trpc.yarn.getStockAlerts.useQuery()
  const { data: valueAnalysis } = trpc.yarn.getValueAnalysis.useQuery({ timeRange: parseInt(timeRange) })
  const { data: usageStats } = trpc.yarn.getUsageStatistics.useQuery({
    timeRange: parseInt(timeRange)
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
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
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Garn Analyse</h2>
          <p className="text-muted-foreground">
            Innsikt i garn-beholdning og bruksmønstre
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Siste 7 dager</SelectItem>
              <SelectItem value="30">Siste 30 dager</SelectItem>
              <SelectItem value="90">Siste 90 dager</SelectItem>
              <SelectItem value="365">Siste år</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Eksporter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
            <CardTitle className="text-xs font-medium">Total Verdi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-xl font-bold leading-none">
              {valueAnalysis?.totalValue ? `${valueAnalysis.totalValue.toFixed(0)} kr` : '0 kr'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {valueAnalysis?.valueChange ? (
                <span className={`flex items-center ${valueAnalysis.valueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {valueAnalysis.valueChange > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(valueAnalysis.valueChange).toFixed(1)}% fra forrige periode
                </span>
              ) : (
                'Ingen endring'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
            <CardTitle className="text-xs font-medium">Aktive Prosjekter</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-xl font-bold leading-none">
              {usageStats?.activeProjects || 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {usageStats?.projectsUsingYarn || 0} bruker garn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
            <CardTitle className="text-xs font-medium">Lav Beholdning</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-xl font-bold text-amber-600 leading-none">
              {stockAlerts?.lowStockCount || 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Garn med lav beholdning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
            <CardTitle className="text-xs font-medium">Unike Farger</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-xl font-bold leading-none">
              {analyticsData?.uniqueColors || 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              På tvers av {analyticsData?.totalMasters || 0} garntyper
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Beholdning</TabsTrigger>
          <TabsTrigger value="usage">Forbruk</TabsTrigger>
          <TabsTrigger value="alerts">Varsler</TabsTrigger>
          <TabsTrigger value="trends">Trender</TabsTrigger>
        </TabsList>

        {/* Inventory Analysis */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Producers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Populære Produsenter
                </CardTitle>
                <CardDescription>
                  Rangert etter totalt antall nøster
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analyticsData?.topProducers || []).map((producer, index) => (
                    <div key={producer.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{producer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {producer.masterCount} garntyper
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{producer.totalSkeins} nøster</div>
                        <div className="text-sm text-muted-foreground">
                          {producer.totalValue?.toFixed(0)} kr
                        </div>
                      </div>
                    </div>
                  )) || <div className="text-center text-muted-foreground py-4">Ingen data</div>}
                </div>
              </CardContent>
            </Card>

            {/* Popular Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Populære Farger
                </CardTitle>
                <CardDescription>
                  Farger du har mest av
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analyticsData?.topColors || []).map((color, index) => (
                    <div key={color.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: color.colorCode || '#9CA3AF' }}
                          title={color.colorCode || 'Ingen fargekode'}
                        />
                        <div>
                          <div className="font-medium">{color.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {color.batchCount} batches
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{color.totalSkeins} nøster</div>
                        <div className="text-sm text-muted-foreground">
                          {color.totalValue?.toFixed(0)} kr
                        </div>
                      </div>
                    </div>
                  )) || <div className="text-center text-muted-foreground py-4">Ingen data</div>}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Usage Analysis */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Most Used Yarn Types */}
            <Card>
              <CardHeader>
                <CardTitle>Mest Brukte Garntyper</CardTitle>
                <CardDescription>
                  Rangert etter mengde brukt i prosjekter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(usageStats?.mostUsedYarns || []).map((yarn, index) => (
                    <div key={yarn.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center text-xs font-medium text-green-600">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{yarn.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {yarn.producer}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{yarn.totalUsed} brukt</div>
                        <div className="text-sm text-muted-foreground">
                          {yarn.projectCount} prosjekter
                        </div>
                      </div>
                    </div>
                  )) || <div className="text-center text-muted-foreground py-4">Ingen bruksdata</div>}
                </div>
              </CardContent>
            </Card>

            {/* Project Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Prosjekt Status</CardTitle>
                <CardDescription>
                  Fordeling av prosjekt-statuser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(usageStats?.projectStatusDistribution || []).map((status) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status.status === 'COMPLETED' ? 'bg-green-500' :
                          status.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                          status.status === 'PLANNED' ? 'bg-gray-400' :
                          status.status === 'ON_HOLD' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <span className="font-medium">
                          {status.status === 'COMPLETED' ? 'Fullført' :
                           status.status === 'IN_PROGRESS' ? 'Pågående' :
                           status.status === 'PLANNED' ? 'Planlagt' :
                           status.status === 'ON_HOLD' ? 'På vent' :
                           'Avbrutt'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{status.count}</span>
                        <span className="text-sm text-muted-foreground">
                          ({status.percentage?.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )) || <div className="text-center text-muted-foreground py-4">Ingen prosjektdata</div>}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Stock Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            
            {stockAlerts?.lowStockItems && stockAlerts.lowStockItems.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <Clock className="h-5 w-5" />
                    Lav Beholdning Varsler
                  </CardTitle>
                  <CardDescription>
                    Garn som snart går tom
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stockAlerts.lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.batchInfo?.color} - {item.batchInfo?.batchNumber}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-amber-600">
                            {item.availableQuantity} {item.unit} igjen
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.stockLevel === 'CRITICAL' ? 'Kritisk' : 'Lav'}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-green-600 mb-2">Ingen lav beholdning varsler</h3>
                  <p className="text-muted-foreground text-center">
                    Alle garn har tilstrekkelig beholdning.
                  </p>
                </CardContent>
              </Card>
            )}

          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Innkjøpstrender</CardTitle>
                <CardDescription>
                  Analyse av innkjøpsmønstre over tid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  📊 Trendanalyse kommer snart
                  <p className="text-sm mt-2">
                    Her vil du se grafer over innkjøp, bruk og beholdning over tid
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
