'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import { Loader2, Download, TrendingUp, Package, MapPin, Activity, DollarSign, BarChart3, PieChart, Clock, FileText } from 'lucide-react'
import { useState } from 'react'
import { ExportDialog } from '@/components/reports/ExportDialog'

interface ChartData {
  label: string
  value: number
  percentage?: number
}

function SimpleBarChart({ data, title }: { data: ChartData[], title: string }) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <div className="space-y-2">
        {data.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-xs text-gray-600 truncate">{item.label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <div className="text-xs font-medium w-8 text-right">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SimplePieChart({ data, title }: { data: ChartData[], title: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <div className="space-y-2">
        {data.slice(0, 6).map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex-1 text-xs text-gray-600 truncate">{item.label}</div>
              <div className="text-xs font-medium">{item.value}</div>
              <div className="text-xs text-gray-500">({percentage.toFixed(1)}%)</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TimelineChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
  const maxValue = Math.max(...entries.map(([, value]) => value))
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Inventar over tid</h4>
      <div className="flex items-end gap-1 h-24">
        {entries.slice(-12).map(([month, value], index) => (
          <div key={index} className="flex flex-col items-center gap-1 flex-1">
            <div 
              className="bg-blue-500 rounded-t w-full min-h-[2px] transition-all duration-300"
              style={{ height: `${(value / maxValue) * 80}px` }}
              title={`${month}: ${value} gjenstander`}
            />
            <div className="text-xs text-gray-500 transform -rotate-45 origin-top-left">
              {month.split('-')[1]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function InventoryAnalytics() {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('csv')
  const [isExporting, setIsExporting] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  const { data: analytics, isLoading, error } = trpc.analytics.getInventoryStats.useQuery()
  const { data: categoryAnalytics } = trpc.analytics.getCategoryAnalytics.useQuery()
  const { data: locationAnalytics } = trpc.analytics.getLocationAnalytics.useQuery()
  const { data: activityInsights } = trpc.analytics.getActivityInsights.useQuery({ days: 30 })

  const exportData = trpc.analytics.getExportData.useMutation({
    onSuccess: (data) => {
      // Create and download file
      const content = exportFormat === 'json' 
        ? JSON.stringify(data, null, 2)
        : convertToCSV(data.data)
      
      const blob = new Blob([content], { 
        type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `inventar-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setIsExporting(false)
    },
    onError: () => {
      setIsExporting(false)
    }
  })

  const handleExport = async () => {
    setIsExporting(true)
    await exportData.mutateAsync({ format: exportFormat, includeImages: false })
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Feil ved lasting av analytics</CardTitle>
          <CardDescription className="text-red-600">
            Kunne ikke laste analytics data: {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!analytics) return null

  // Prepare chart data
  const categoryChartData: ChartData[] = Object.entries(analytics.categoryDistribution)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  const locationChartData: ChartData[] = Object.entries(analytics.locationUsage)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  const activityChartData: ChartData[] = Object.entries(analytics.activityHeatmap)
    .map(([hour, value]) => ({ label: `${hour}:00`, value }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Detaljert oversikt over inventaret ditt
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Generer rapport
          </Button>
          <select 
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Rask eksport
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale gjenstander</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Fordelt på {Object.keys(analytics.categoryDistribution).length} kategorier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale lokasjoner</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalLocations}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.totalItems > 0 
                ? `Gjennomsnitt ${(analytics.overview.totalItems / analytics.overview.totalLocations).toFixed(1)} gjenstander per lokasjon`
                : 'Ingen gjenstander ennå'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimert verdi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.totalValue.toLocaleString('nb-NO')} kr
            </div>
            <p className="text-xs text-muted-foreground">
              Basert på {analytics.valueEstimate.itemsWithPrice} gjenstander med pris
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiviteter (30d)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              {activityInsights?.averagePerDay.toFixed(1)} per dag i gjennomsnitt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Kategori fordeling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={categoryChartData} title="" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Mest brukte lokasjoner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={locationChartData} title="" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Inventar over tid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineChart data={analytics.timeline} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Aktivitet etter tidspunkt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={activityChartData} title="" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verdi analyse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total verdi:</span>
                <span className="font-medium">{analytics.valueEstimate.total.toLocaleString('nb-NO')} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Gjennomsnitt:</span>
                <span className="font-medium">{analytics.valueEstimate.average.toLocaleString('nb-NO')} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Høyeste verdi:</span>
                <span className="font-medium">{analytics.valueEstimate.highest.toLocaleString('nb-NO')} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Med pris:</span>
                <span className="font-medium">{analytics.valueEstimate.itemsWithPrice} / {analytics.overview.totalItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utlån status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.overview.activeLoans}
              </div>
              <div className="text-sm text-gray-600">Aktive utlån</div>
            </div>
            {analytics.overview.activeLoans > 0 && (
              <Badge variant="outline" className="w-full justify-center">
                Sjekk utlån-siden for detaljer
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      {categoryAnalytics && categoryAnalytics.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Kategori detaljer</CardTitle>
            <CardDescription>
              Detaljert oversikt over hver kategori
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAnalytics.map((category) => (
                <div key={category.id} className="border rounded-lg p-4 space-y-2">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Gjenstander:</span>
                      <span>{category.itemCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total verdi:</span>
                      <span>{category.totalValue.toLocaleString('nb-NO')} kr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gj.snitt verdi:</span>
                      <span>{category.averageValue.toLocaleString('nb-NO')} kr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ny aktivitet:</span>
                      <span>{category.recentActivity} (7d)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Dialog */}
      <ExportDialog 
        isOpen={isExportDialogOpen} 
        onClose={() => setIsExportDialogOpen(false)} 
      />
    </div>
  )
}
