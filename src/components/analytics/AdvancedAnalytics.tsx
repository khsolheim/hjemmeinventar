'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  Zap,
  Lightbulb,
  Clock,
  Calendar,
  DollarSign,
  Package,
  Users,
  Activity,
  PieChart,
  LineChart,
  Scatter,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Star,
  Award,
  Trophy,
  Crown,
  Rocket,
  Sparkles
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedAnalyticsProps {
  className?: string
}

export function AdvancedAnalytics({ className }: AdvancedAnalyticsProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'predictions' | 'insights' | 'ml'>('overview')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const haptic = useHapticFeedback()

  // Analytics queries
  const overviewQuery = trpc.analytics.getOverview.useQuery({ timeRange })
  const predictionsQuery = trpc.analytics.getPredictions.useQuery({ timeRange })
  const insightsQuery = trpc.analytics.getInsights.useQuery({ timeRange })
  const mlQuery = trpc.analytics.getMLInsights.useQuery({ timeRange })

  const generateReportMutation = trpc.analytics.generateReport.useMutation()
  const exportDataMutation = trpc.analytics.exportData.useMutation()

  const handleGenerateReport = async () => {
    haptic.success()
    try {
      await generateReportMutation.mutateAsync({ timeRange })
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  const handleExportData = async () => {
    haptic.light()
    try {
      await exportDataMutation.mutateAsync({ timeRange })
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return { icon: TrendingUp, color: 'text-green-600' }
    if (trend < 0) return { icon: TrendingDown, color: 'text-red-600' }
    return { icon: Activity, color: 'text-gray-600' }
  }

  const getInsightPriority = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
      case 'medium': return { color: 'bg-yellow-100 text-yellow-800', icon: Info }
      case 'low': return { color: 'bg-blue-100 text-blue-800', icon: Info }
      default: return { color: 'bg-gray-100 text-gray-800', icon: Info }
    }
  }

  const getMLConfidence = (confidence: number) => {
    if (confidence >= 90) return { color: 'text-green-600', label: 'Høy' }
    if (confidence >= 70) return { color: 'text-yellow-600', label: 'Medium' }
    return { color: 'text-red-600', label: 'Lav' }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Machine Learning insights og prediktiv analyse
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            ML Powered
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Real-time
          </Badge>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Tidsperiode:</span>
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' && '7 dager'}
              {range === '30d' && '30 dager'}
              {range === '90d' && '90 dager'}
              {range === '1y' && '1 år'}
            </Button>
          ))}
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total verdi</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overviewQuery.data?.totalValue?.toLocaleString() || '0'} kr
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {(() => {
                const trend = getTrendIcon(overviewQuery.data?.valueTrend || 0)
                const TrendIcon = trend.icon
                return (
                  <>
                    <TrendIcon className={`w-3 h-3 ${trend.color}`} />
                    {Math.abs(overviewQuery.data?.valueTrend || 0)}% fra forrige periode
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive gjenstander</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overviewQuery.data?.activeItems || 0}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {(() => {
                const trend = getTrendIcon(overviewQuery.data?.itemsTrend || 0)
                const TrendIcon = trend.icon
                return (
                  <>
                    <TrendIcon className={`w-3 h-3 ${trend.color}`} />
                    {Math.abs(overviewQuery.data?.itemsTrend || 0)}% fra forrige periode
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Score</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mlQuery.data?.mlScore || 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              Intelligens-nivå
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediksjoner</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {predictionsQuery.data?.accuracy || 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              Nøyaktighet
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('overview')}
          className="flex-1"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Oversikt
        </Button>
        <Button
          variant={selectedTab === 'predictions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('predictions')}
          className="flex-1"
        >
          <Target className="w-4 h-4 mr-2" />
          Prediksjoner
        </Button>
        <Button
          variant={selectedTab === 'insights' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('insights')}
          className="flex-1"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Innsikt
        </Button>
        <Button
          variant={selectedTab === 'ml' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('ml')}
          className="flex-1"
        >
          <Brain className="w-4 h-4 mr-2" />
          ML
        </Button>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Value Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Verdifordeling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overviewQuery.data?.valueDistribution?.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.value.toLocaleString()} kr
                        </span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Aktivitets-trender
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overviewQuery.data?.activityTrends?.map((trend) => {
                    const trendIcon = getTrendIcon(trend.change)
                    const TrendIcon = trendIcon.icon
                    
                    return (
                      <div key={trend.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendIcon className={`w-4 h-4 ${trendIcon.color}`} />
                          <span className="text-sm">{trend.name}</span>
                        </div>
                        <span className={`text-sm font-medium ${trendIcon.color}`}>
                          {trend.change > 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {selectedTab === 'predictions' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Prediktive modeller
              </CardTitle>
              <CardDescription>
                Machine Learning prediksjoner og forutsigelser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictionsQuery.data?.models?.map((model) => {
                  const confidence = getMLConfidence(model.confidence)
                  
                  return (
                    <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Brain className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {model.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={`${confidence.color.replace('text-', 'bg-').replace('-600', '-100')} ${confidence.color}`}>
                          {confidence.label} tillit
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">{model.accuracy}%</div>
                          <div className="text-xs text-muted-foreground">Nøyaktighet</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Tab */}
      {selectedTab === 'insights' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Business Intelligence
              </CardTitle>
              <CardDescription>
                Intelligente innsikt og anbefalinger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightsQuery.data?.insights?.map((insight) => {
                  const priority = getInsightPriority(insight.priority)
                  const PriorityIcon = priority.icon
                  
                  return (
                    <div key={insight.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${priority.color}`}>
                        <PriorityIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{insight.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {insight.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.impact} påvirkning
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{insight.confidence}%</div>
                        <div className="text-xs text-muted-foreground">Tillit</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ML Tab */}
      {selectedTab === 'ml' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ML Models */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  ML Modeller
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mlQuery.data?.models?.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {model.type} • {model.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{model.accuracy}%</div>
                        <div className="text-xs text-muted-foreground">Nøyaktighet</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ML Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  ML Ytelse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mlQuery.data?.performance?.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm font-medium">{metric.value}</span>
                      </div>
                      <Progress value={metric.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ML Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                ML Anbefalinger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mlQuery.data?.recommendations?.map((rec) => (
                  <div key={rec.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{rec.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {rec.description}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {rec.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Raske handlinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Download className="w-5 h-5" />
              <span className="text-sm">Eksporter data</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">Oppdater modeller</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">Detaljert rapport</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Filter className="w-5 h-5" />
              <span className="text-sm">Avanserte filtre</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
