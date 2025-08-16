'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { BarChart, TrendingUp, TrendingDown, DollarSign, Clock, Printer, FileText, Users, Calendar, Download, RefreshCw, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'

interface AnalyticsData {
  overview: {
    totalJobs: number
    successRate: number
    averageCost: number
    totalCost: number
    averageDuration: number
    activeTemplates: number
    activePrinters: number
    totalUsers: number
  }
  trends: {
    jobsOverTime: Array<{ date: string; jobs: number; success: number; failed: number }>
    costOverTime: Array<{ date: string; cost: number }>
    templateUsage: Array<{ templateName: string; count: number; percentage: number }>
    printerUsage: Array<{ printerName: string; jobs: number; utilization: number }>
  }
  performance: {
    successRateByTemplate: Array<{ template: string; successRate: number; totalJobs: number }>
    averageDurationByPrinter: Array<{ printer: string; avgDuration: number; jobs: number }>
    errorsByType: Array<{ errorType: string; count: number; percentage: number }>
    peakHours: Array<{ hour: number; jobs: number }>
  }
  costs: {
    totalByPeriod: Array<{ period: string; cost: number }>
    costByTemplate: Array<{ template: string; cost: number; jobs: number }>
    costByUser: Array<{ user: string; cost: number; jobs: number }>
    projectedMonthlyCost: number
  }
}

export default function AnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'performance' | 'costs'>('overview')
  const [timeRange, setTimeRange] = useState('30days')
  const [reportType, setReportType] = useState('summary')

  // tRPC queries
  const { 
    data: analytics, 
    isLoading, 
    refetch: refetchAnalytics 
  } = trpc.printing.getAnalytics.useQuery({
    timeRange,
    includeDetails: true
  })

  const exportAnalyticsMutation = trpc.printing.exportAnalytics.useMutation()

  const handleExportReport = async () => {
    try {
      await exportAnalyticsMutation.mutateAsync({
        format: 'PDF',
        timeRange,
        sections: ['overview', 'trends', 'performance', 'costs']
      })
    } catch (error) {
      console.error('Feil ved eksport:', error)
    }
  }

  // Mock data for demonstration
  const mockAnalytics: AnalyticsData = {
    overview: {
      totalJobs: 1247,
      successRate: 94.2,
      averageCost: 2.34,
      totalCost: 2919.98,
      averageDuration: 4.2,
      activeTemplates: 23,
      activePrinters: 6,
      totalUsers: 12
    },
    trends: {
      jobsOverTime: [
        { date: '2025-01-01', jobs: 45, success: 42, failed: 3 },
        { date: '2025-01-02', jobs: 52, success: 49, failed: 3 },
        { date: '2025-01-03', jobs: 38, success: 36, failed: 2 },
        { date: '2025-01-04', jobs: 61, success: 58, failed: 3 },
        { date: '2025-01-05', jobs: 47, success: 44, failed: 3 }
      ],
      costOverTime: [
        { date: '2025-01-01', cost: 105.30 },
        { date: '2025-01-02', cost: 121.68 },
        { date: '2025-01-03', cost: 88.92 },
        { date: '2025-01-04', cost: 142.74 },
        { date: '2025-01-05', cost: 110.04 }
      ],
      templateUsage: [
        { templateName: 'QR Lokasjonsetikett', count: 324, percentage: 26.0 },
        { templateName: 'Varestrekkode', count: 287, percentage: 23.0 },
        { templateName: 'Forsendelseetikett', count: 198, percentage: 15.9 },
        { templateName: 'Inventaretikett', count: 156, percentage: 12.5 },
        { templateName: 'Andre', count: 282, percentage: 22.6 }
      ],
      printerUsage: [
        { printerName: 'DYMO LW-450 Kontor', jobs: 421, utilization: 82.3 },
        { printerName: 'DYMO LW-550 Lager', jobs: 389, utilization: 76.2 },
        { printerName: 'Zebra ZD420 Pakking', jobs: 267, utilization: 52.3 },
        { printerName: 'Brother QL-800 Resepsjon', jobs: 170, utilization: 33.3 }
      ]
    },
    performance: {
      successRateByTemplate: [
        { template: 'QR Lokasjonsetikett', successRate: 97.8, totalJobs: 324 },
        { template: 'Varestrekkode', successRate: 95.1, totalJobs: 287 },
        { template: 'Forsendelseetikett', successRate: 91.4, totalJobs: 198 },
        { template: 'Inventaretikett', successRate: 93.6, totalJobs: 156 }
      ],
      averageDurationByPrinter: [
        { printer: 'DYMO LW-450 Kontor', avgDuration: 3.2, jobs: 421 },
        { printer: 'DYMO LW-550 Lager', avgDuration: 2.8, jobs: 389 },
        { printer: 'Zebra ZD420 Pakking', avgDuration: 5.1, jobs: 267 },
        { printer: 'Brother QL-800 Resepsjon', avgDuration: 4.7, jobs: 170 }
      ],
      errorsByType: [
        { errorType: 'Tilkoblingsfeil', count: 23, percentage: 32.4 },
        { errorType: 'Papir tom', count: 18, percentage: 25.4 },
        { errorType: 'Malformat feil', count: 15, percentage: 21.1 },
        { errorType: 'Timeout', count: 10, percentage: 14.1 },
        { errorType: 'Andre', count: 5, percentage: 7.0 }
      ],
      peakHours: [
        { hour: 8, jobs: 67 },
        { hour: 9, jobs: 89 },
        { hour: 10, jobs: 124 },
        { hour: 11, jobs: 98 },
        { hour: 12, jobs: 45 },
        { hour: 13, jobs: 56 },
        { hour: 14, jobs: 87 },
        { hour: 15, jobs: 76 },
        { hour: 16, jobs: 54 }
      ]
    },
    costs: {
      totalByPeriod: [
        { period: 'Uke 1', cost: 568.72 },
        { period: 'Uke 2', cost: 634.45 },
        { period: 'Uke 3', cost: 489.23 },
        { period: 'Uke 4', cost: 721.58 },
        { period: 'Uke 5', cost: 506.00 }
      ],
      costByTemplate: [
        { template: 'QR Lokasjonsetikett', cost: 758.16, jobs: 324 },
        { template: 'Varestrekkode', cost: 671.94, jobs: 287 },
        { template: 'Forsendelseetikett', cost: 504.66, jobs: 198 },
        { template: 'Inventaretikett', cost: 364.92, jobs: 156 }
      ],
      costByUser: [
        { user: 'Lars Hansen', cost: 456.78, jobs: 187 },
        { user: 'Kari Nordmann', cost: 389.45, jobs: 162 },
        { user: 'Ole Olsen', cost: 324.67, jobs: 134 },
        { user: 'Anne Andersen', cost: 298.23, jobs: 123 }
      ],
      projectedMonthlyCost: 3247.89
    }
  }

  const StatCard = ({ title, value, change, changeType, icon: Icon, subtitle }: {
    title: string
    value: string | number
    change?: number
    changeType?: 'positive' | 'negative' | 'neutral'
    icon: any
    subtitle?: string
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {change !== undefined && (
          <div className="flex items-center pt-1">
            {changeType === 'positive' ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : changeType === 'negative' ? (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            ) : null}
            <span className={`text-xs ${
              changeType === 'positive' ? 'text-green-600' :
              changeType === 'negative' ? 'text-red-600' :
              'text-muted-foreground'
            }`}>
              {change > 0 ? '+' : ''}{change}% fra forrige periode
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const SimpleChart = ({ data, title, type = 'bar' }: {
    data: Array<{ name: string; value: number; color?: string }>
    title: string
    type?: 'bar' | 'line'
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate flex-1 mr-4">
                {item.name}
              </span>
              <div className="flex items-center gap-2 min-w-[100px]">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color || 'bg-blue-600'}`}
                    style={{ 
                      width: `${Math.min((item.value / Math.max(...data.map(d => d.value))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {typeof item.value === 'number' && item.value < 100 
                    ? item.value.toFixed(1) 
                    : Math.round(item.value)
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Print Analytics</h1>
          <p className="text-muted-foreground">
            Detaljert analyse av utskriftsaktivitet og ytelse
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Siste 7 dager</SelectItem>
              <SelectItem value="30days">Siste 30 dager</SelectItem>
              <SelectItem value="90days">Siste 3 måneder</SelectItem>
              <SelectItem value="1year">Siste år</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={refetchAnalytics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Oppdater
          </Button>
          
          <Button onClick={handleExportReport} disabled={exportAnalyticsMutation.isLoading}>
            <Download className="h-4 w-4 mr-2" />
            {exportAnalyticsMutation.isLoading ? 'Eksporterer...' : 'Eksporter rapport'}
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Oversikt
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trender
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ytelse
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Kostnader
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Totale jobber"
              value={mockAnalytics.overview.totalJobs.toLocaleString()}
              change={12.3}
              changeType="positive"
              icon={FileText}
            />
            <StatCard
              title="Suksessrate"
              value={`${mockAnalytics.overview.successRate}%`}
              change={-1.2}
              changeType="negative"
              icon={CheckCircle}
            />
            <StatCard
              title="Gjennomsnittskostnad"
              value={`${mockAnalytics.overview.averageCost} kr`}
              change={0.8}
              changeType="positive"
              icon={DollarSign}
            />
            <StatCard
              title="Total kostnad"
              value={`${mockAnalytics.overview.totalCost.toLocaleString()} kr`}
              change={15.4}
              changeType="positive"
              icon={DollarSign}
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Gj.snitt varighet"
              value={`${mockAnalytics.overview.averageDuration}s`}
              change={-5.2}
              changeType="positive"
              icon={Clock}
              subtitle="Per utskriftsjobb"
            />
            <StatCard
              title="Aktive maler"
              value={mockAnalytics.overview.activeTemplates}
              icon={FileText}
              subtitle="I bruk denne perioden"
            />
            <StatCard
              title="Aktive skrivere"
              value={mockAnalytics.overview.activePrinters}
              icon={Printer}
              subtitle="Tilkoblede og operative"
            />
            <StatCard
              title="Aktive brukere"
              value={mockAnalytics.overview.totalUsers}
              icon={Users}
              subtitle="Har skrevet ut"
            />
          </div>

          {/* Quick Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SimpleChart
              title="Mest brukte maler"
              data={mockAnalytics.trends.templateUsage.map(t => ({
                name: t.templateName,
                value: t.count
              }))}
            />
            
            <SimpleChart
              title="Skriver-utnyttelse"
              data={mockAnalytics.trends.printerUsage.map(p => ({
                name: p.printerName,
                value: p.utilization,
                color: p.utilization > 70 ? 'bg-red-500' : p.utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jobs Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Utskriftsjobber over tid</CardTitle>
                <CardDescription>Daglige jobber med suksess/feil fordeling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.trends.jobsOverTime.map((day, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{new Date(day.date).toLocaleDateString('no-NO')}</span>
                        <span className="font-medium">{day.jobs} jobber</span>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div 
                          className="bg-green-500 rounded-l"
                          style={{ width: `${(day.success / day.jobs) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-red-500 rounded-r"
                          style={{ width: `${(day.failed / day.jobs) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="text-green-600">{day.success} suksess</span>
                        <span className="text-red-600">{day.failed} feil</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Kostnader over tid</CardTitle>
                <CardDescription>Daglige utskriftskostnader</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.trends.costOverTime.map((day, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{new Date(day.date).toLocaleDateString('no-NO')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min((day.cost / Math.max(...mockAnalytics.trends.costOverTime.map(d => d.cost))) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-16 text-right">{day.cost.toFixed(2)} kr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Peak Hours Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Aktivitet per time</CardTitle>
              <CardDescription>Utskriftsaktivitet gjennom dagen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-9 gap-2">
                {mockAnalytics.performance.peakHours.map((hour) => (
                  <div key={hour.hour} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {hour.hour.toString().padStart(2, '0')}:00
                    </div>
                    <div 
                      className="bg-blue-600 rounded mx-auto"
                      style={{ 
                        height: `${Math.max((hour.jobs / Math.max(...mockAnalytics.performance.peakHours.map(h => h.jobs))) * 60, 4)}px`,
                        width: '20px'
                      }}
                    ></div>
                    <div className="text-xs font-medium mt-1">{hour.jobs}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChart
              title="Suksessrate per mal"
              data={mockAnalytics.performance.successRateByTemplate.map(t => ({
                name: `${t.template} (${t.totalJobs})`,
                value: t.successRate,
                color: t.successRate > 95 ? 'bg-green-500' : t.successRate > 90 ? 'bg-yellow-500' : 'bg-red-500'
              }))}
            />
            
            <SimpleChart
              title="Gjennomsnittlig varighet per skriver"
              data={mockAnalytics.performance.averageDurationByPrinter.map(p => ({
                name: `${p.printer} (${p.jobs})`,
                value: p.avgDuration,
                color: p.avgDuration < 4 ? 'bg-green-500' : p.avgDuration < 6 ? 'bg-yellow-500' : 'bg-red-500'
              }))}
            />
          </div>

          {/* Error Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Feilanalyse</CardTitle>
              <CardDescription>Fordeling av feiltyper</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAnalytics.performance.errorsByType.map((error, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{error.errorType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${error.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{error.count}</span>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {error.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cost by Period */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Kostnader per periode</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.costs.totalByPeriod.map((period, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{period.period}</span>
                      <span className="font-medium">{period.cost.toFixed(2)} kr</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost by Template */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Kostnader per mal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.costs.costByTemplate.map((template, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{template.template}</span>
                        <span className="font-medium">{template.cost.toFixed(2)} kr</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {template.jobs} jobber • {(template.cost / template.jobs).toFixed(2)} kr per jobb
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projected Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Kostnadsprognoser</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Projisert månedskostnad:</span>
                    <span className="font-medium">{mockAnalytics.costs.projectedMonthlyCost.toFixed(2)} kr</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Basert på gjeldende trend
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Årlig prognose:</span>
                    <span className="font-medium">{(mockAnalytics.costs.projectedMonthlyCost * 12).toFixed(2)} kr</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Anbefalt månedlig budsjett: {(mockAnalytics.costs.projectedMonthlyCost * 1.2).toFixed(2)} kr
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Users by Cost */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Kostnader per bruker</CardTitle>
              <CardDescription>Brukere rangert etter utskriftskostnader</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAnalytics.costs.costByUser.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {user.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">{user.user}</span>
                        <div className="text-xs text-muted-foreground">{user.jobs} jobber</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{user.cost.toFixed(2)} kr</div>
                      <div className="text-xs text-muted-foreground">
                        {(user.cost / user.jobs).toFixed(2)} kr/jobb
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}