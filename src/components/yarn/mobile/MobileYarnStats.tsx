'use client'

import { TrendingUp, TrendingDown, Package, DollarSign, Palette, AlertTriangle, ShoppingCart, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'

export function MobileYarnStats() {
  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = trpc.yarn.getYarnAnalytics.useQuery({
    timeRange: 30,
    groupBy: 'producer'
  })

  const { data: stockAlerts, isLoading: alertsLoading } = trpc.yarn.getStockAlerts.useQuery()
  const { data: valueAnalysis, isLoading: valueLoading } = trpc.yarn.getValueAnalysis.useQuery()
  const { data: usageStats, isLoading: usageLoading } = trpc.yarn.getUsageStatistics.useQuery({
    timeRange: 30
  })

  const isLoading = analyticsLoading || alertsLoading || valueLoading || usageLoading

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Verdi</span>
            </div>
            <div className="text-xl font-bold">
              {valueAnalysis?.totalValue ? `${valueAnalysis.totalValue.toFixed(0)} kr` : '0 kr'}
            </div>
            {valueAnalysis?.valueChange !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${
                valueAnalysis.valueChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {valueAnalysis.valueChange > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(valueAnalysis.valueChange).toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Prosjekter</span>
            </div>
            <div className="text-xl font-bold">
              {usageStats?.activeProjects || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {usageStats?.projectsUsingYarn || 0} bruker garn
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">Lav Beholdning</span>
            </div>
            <div className="text-xl font-bold text-amber-600">
              {stockAlerts?.lowStockCount || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              garn trenger påfyll
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Farger</span>
            </div>
            <div className="text-xl font-bold">
              {analyticsData?.uniqueColors || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              unike farger
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {stockAlerts?.lowStockItems && stockAlerts.lowStockItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Lav Beholdning
            </CardTitle>
            <CardDescription>
              Garn som snart går tom
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(stockAlerts?.lowStockItems || []).slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.batchInfo?.color} - {item.batchInfo?.batchNumber}
                  </div>
                </div>
                <Badge 
                  variant={item.stockLevel === 'CRITICAL' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {item.availableQuantity} {item.unit}
                </Badge>
              </div>
            ))}
            {(stockAlerts?.lowStockItems?.length || 0) > 5 && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                +{(stockAlerts?.lowStockItems?.length || 0) - 5} flere items
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Producers */}
      {analyticsData?.topProducers && analyticsData.topProducers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Populære Produsenter
            </CardTitle>
            <CardDescription>
              Rangert etter antall nøster
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analyticsData?.topProducers || []).slice(0, 5).map((producer, index) => (
              <div key={producer.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">{producer.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{producer.totalSkeins}</div>
                    <div className="text-xs text-muted-foreground">nøster</div>
                  </div>
                </div>
                <Progress 
                  value={(producer.totalSkeins / (analyticsData.topProducers[0]?.totalSkeins || 1)) * 100} 
                  className="h-1"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Top Colors */}
      {analyticsData?.topColors && analyticsData.topColors.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Populære Farger
            </CardTitle>
            <CardDescription>
              Farger du har mest av
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analyticsData?.topColors || []).slice(0, 5).map((color) => (
              <div key={color.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: color.colorCode || '#9CA3AF' }}
                  />
                  <div>
                    <div className="font-medium text-sm">{color.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {color.batchCount} batches
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{color.totalSkeins}</div>
                  <div className="text-xs text-muted-foreground">nøster</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Project Status */}
      {usageStats?.projectStatusDistribution && usageStats.projectStatusDistribution.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Prosjekt Status
            </CardTitle>
            <CardDescription>
              Fordeling av prosjekt-statuser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
                  <span className="text-sm font-medium">
                    {status.status === 'COMPLETED' ? 'Fullført' :
                     status.status === 'IN_PROGRESS' ? 'Pågående' :
                     status.status === 'PLANNED' ? 'Planlagt' :
                     status.status === 'ON_HOLD' ? 'På vent' :
                     'Avbrutt'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{status.count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({status.percentage?.toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
